from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np

# ===== ResNet9 Model Definition =====
def conv_block(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
              nn.BatchNorm2d(out_channels),
              nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(2))
    return nn.Sequential(*layers)

class ResNet9(nn.Module):
    def __init__(self, in_channels, num_classes):
        super().__init__()
        self.conv1 = conv_block(in_channels, 64)
        self.conv2 = conv_block(64, 128, pool=True)
        self.res1 = nn.Sequential(conv_block(128, 128), conv_block(128, 128))
        self.conv3 = conv_block(128, 256, pool=True)
        self.conv4 = conv_block(256, 512, pool=True)
        self.res2 = nn.Sequential(conv_block(512, 512), conv_block(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                       nn.Flatten(),
                                       nn.Linear(512, num_classes))

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

# ===== 38 Plant Disease Classes =====
DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot_(Gray_leaf_spot)",
    "Corn_(maize)___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_(Two-spotted_spider_mite)",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

CROP_ALIASES = {
    "all": ["*"],
    "apple": ["Apple"],
    "blueberry": ["Blueberry"],
    "cherry": ["Cherry_(including_sour)"],
    "maize": ["Corn_(maize)"],
    "corn": ["Corn_(maize)"],
    "grape": ["Grape"],
    "orange": ["Orange"],
    "peach": ["Peach"],
    "pepper": ["Pepper,_bell"],
    "bell pepper": ["Pepper,_bell"],
    "potato": ["Potato"],
    "raspberry": ["Raspberry"],
    "soybean": ["Soybean"],
    "squash": ["Squash"],
    "strawberry": ["Strawberry"],
    "tomato": ["Tomato"]
}

def get_allowed_indices(crop_name):
    crop_key = (crop_name or "all").strip().lower()
    aliases = CROP_ALIASES.get(crop_key)
    if not aliases:
        return []
    if aliases == ["*"]:
        return list(range(len(DISEASE_CLASSES)))

    allowed = []
    for idx, class_name in enumerate(DISEASE_CLASSES):
        class_crop = class_name.split("___", 1)[0]
        if class_crop in aliases:
            allowed.append(idx)
    return allowed

def assess_image_quality(image_rgb):
    # Basic quality checks to detect very dark, very bright, or blurry uploads.
    arr = np.asarray(image_rgb, dtype=np.float32)
    gray = arr.mean(axis=2)
    brightness = float(gray.mean())

    # Simple blur proxy using variance of finite differences.
    dx = np.diff(gray, axis=1)
    dy = np.diff(gray, axis=0)
    sharpness = float(np.var(dx) + np.var(dy))

    warnings = []
    if brightness < 35:
        warnings.append("Image is very dark. Retake photo in better light.")
    elif brightness > 225:
        warnings.append("Image is overexposed. Reduce glare or direct sunlight.")

    if sharpness < 40:
        warnings.append("Image appears blurry. Hold camera steady and refocus.")

    return {
        'brightness': brightness,
        'sharpness': sharpness,
        'warnings': warnings
    }

# ===== Initialize Flask App =====
app = Flask(__name__)
CORS(app)

# Load model
print("Loading model...")
model = torch.load('plant-disease-model-complete (1).pth', map_location='cpu', weights_only=False)
model.eval()
print("✅ Model loaded successfully!")

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        selected_crop = request.form.get('crop', 'all')
        allowed_indices = get_allowed_indices(selected_crop)
        if not allowed_indices:
            return jsonify({
                'error': f"Selected crop '{selected_crop}' is not supported by this model.",
                'supported_crops': sorted([k for k in CROP_ALIASES.keys() if k != 'all'])
            }), 400

        # Load image once for both quality checks and model preprocessing.
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        quality = assess_image_quality(image)
        image_tensor = transform(image).unsqueeze(0)
        
        # Run inference
        with torch.no_grad():
            outputs = model(image_tensor)
            filtered_logits = outputs[0, allowed_indices]
            filtered_probabilities = torch.nn.functional.softmax(filtered_logits, dim=0)
            confidence, predicted_local = torch.max(filtered_probabilities, dim=0)
        
        # Get results
        class_idx = allowed_indices[predicted_local.item()]
        disease_name = DISEASE_CLASSES[class_idx]
        confidence_score = float(confidence.item()) * 100
        
        # Get top 3 predictions and top-2 margin for uncertainty checks.
        top_k = min(3, len(allowed_indices))
        top_probs, top_local_indices = torch.topk(filtered_probabilities, top_k)

        top_conf = float(top_probs[0].item()) * 100
        second_conf = float(top_probs[1].item()) * 100 if top_k > 1 else 0.0
        confidence_margin = top_conf - second_conf

        uncertainty_reasons = []
        if confidence_score < 75:
            uncertainty_reasons.append("Overall confidence is below 75%.")
        if confidence_margin < 20:
            uncertainty_reasons.append("Top prediction is too close to second-best prediction.")
        uncertainty_reasons.extend(quality['warnings'])

        needs_review = len(uncertainty_reasons) > 0

        top_predictions = [
            {
                'disease': DISEASE_CLASSES[allowed_indices[idx.item()]],
                'confidence': float(prob.item()) * 100
            }
            for prob, idx in zip(top_probs, top_local_indices)
        ]
        
        return jsonify({
            'success': True,
            'crop_filter': selected_crop,
            'disease': disease_name,
            'confidence': confidence_score,
            'top_3': top_predictions,
            'needs_review': needs_review,
            'confidence_margin': confidence_margin,
            'quality': {
                'brightness': quality['brightness'],
                'sharpness': quality['sharpness']
            },
            'uncertainty_reasons': uncertainty_reasons
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'API is running', 'model_classes': len(DISEASE_CLASSES)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
