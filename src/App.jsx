import React, { useEffect, useMemo, useState } from "react";

const diseases = [
  {
    name: "Brown Spot",
    desc: "Circular brown spots with gray center on leaves.",
    severity: "Moderate",
    advice: "Use fungicide like Tricyclazole. Remove affected leaves.",
    crop: ["Rice"]
  },
  {
    name: "Blast",
    desc: "Diamond-shaped lesions with gray-white center.",
    severity: "High",
    advice: "Apply Carbendazim early. Avoid excess nitrogen.",
    crop: ["Rice"]
  },
  {
    name: "Leaf Rust",
    desc: "Orange-brown pustules on leaves.",
    severity: "Medium",
    advice: "Use Propiconazole. Plant resistant varieties.",
    crop: ["Wheat"]
  },
  {
    name: "Early Blight",
    desc: "Dark concentric rings on leaves.",
    severity: "Moderate",
    advice: "Spray Mancozeb. Improve air circulation.",
    crop: ["Tomato", "Potato"]
  },
  {
    name: "Late Blight",
    desc: "Dark green-black patches, white mold.",
    severity: "High",
    advice: "Use Metalaxyl + Mancozeb urgently.",
    crop: ["Potato", "Tomato"]
  },
  {
    name: "Turcicum Leaf Blight",
    desc: "Long grayish-brown streaks.",
    severity: "Medium",
    advice: "Spray Azoxystrobin. Crop rotation helps.",
    crop: ["Maize"]
  },
  {
    name: "Red Rot",
    desc: "Reddening of cane interior, shriveling.",
    severity: "High",
    advice: "Use disease-free setts. Rogue infected plants.",
    crop: ["Sugarcane"]
  }
];

const diseaseImgs = [
  "https://thumbs.dreamstime.com/b/plant-disease-rice-leaves-blight-micro-organism-plant-disease-rice-105425383.jpg",
  "https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41598-024-81143-1/MediaObjects/41598_2024_81143_Fig1_HTML.png",
  "https://www.thespruce.com/thmb/SkGrAk1vX132bHVIEn0QXN6B_Jo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/spruce-tomato-YevheniiOrlov-d0bc52c1acef4fb59eac8519528f8d74.jpg"
];

const weatherCodeLabels = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Dense fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Rain showers",
  81: "Moderate showers",
  82: "Intense showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm with hail"
};

const geocodeEndpoint = "https://geocoding-api.open-meteo.com/v1/search";
const forecastEndpoint = "https://api.open-meteo.com/v1/forecast";
const isGitHubPagesHost =
  typeof window !== "undefined" && /github\.io$/i.test(window.location.hostname);
const defaultHostedApiUrl = "https://leaflens-ml-api.onrender.com";
const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || (isGitHubPagesHost ? defaultHostedApiUrl : "http://localhost:5000")
).replace(/\/$/, "");
const hasConfiguredExternalApi = Boolean(import.meta.env.VITE_API_BASE_URL);

const translations = {
  en: {
    appName: "Leaflens",
    home: "Home",
    services: "Services",
    soil: "Soil",
    about: "About",
    heroKicker: "Precision farming demo for Indian growers",
    heroTitle: "Spot crop disease faster and plan field work with more confidence.",
    heroText: "Leaflens brings crop symptom screening and simple weather guidance into one clear mobile-friendly interface so farmers can review what they see in the field and decide what to do next.",
    tryDemo: "Try Demo",
    seeProjectScope: "See Project Scope",
    platform: "Platform",
    platformTitle: "Built around the three checks growers reach for first",
    platformCopy: "This version is still a frontend demo, but the interface now feels closer to a real product with disease, weather, and soil workflows designed for fast field decisions.",
    diseaseDetection: "Disease Detection",
    leafSymptomScreening: "Leaf symptom screening",
    leafSymptomDesc: "Guide the user from crop selection to image upload with a focused result card and practical treatment advice.",
    weatherPlanning: "Weather Planning",
    fieldReadyForecast: "Field-ready forecast panel",
    forecastDesc: "Summarize temperature, rainfall probability, and a short recommendation for the next three days.",
    soilAnalysis: "Soil Analysis",
    dataDrivernSoil: "Data-driven soil insights",
    soilDesc: "Analyze pH, NPK, moisture, organic carbon, and climate values to get fertility score and major corrective actions.",
    demo01: "Demo 01",
    detectCropDisease: "Detect Crop Disease",
    interviewMode: "Interview Mode",
    detectSimulate: "Simulate a farmer uploading a leaf image and receiving a clear diagnosis card with crop context and next-step advice.",
    selectCrop: "Select Crop",
    uploadLeafPhoto: "Upload Leaf Photo",
    analyzeImage: "Analyze Image",
    cropLimitNote: "Crop list is limited to what your current ML model supports.",
    noImageSelected: "No image selected yet.",
    selectedImage: "Selected image",
    healthCheckMessage: "Checking ML API status...",
    mlApiHealth: "ML API Health",
    recheckApi: "Recheck API",
    checking: "Checking...",
    online: "Online",
    wakingUp: "Waking Up",
    backendReachable: "Backend is reachable and ready for image analysis.",
    renderWakingUp: "Render backend is waking up. Retry in about 30-60 seconds.",
    detectionResult: "Detection Result",
    diseaseNotDetected: "Disease not detected",
    diseaseDetected: "Disease detected",
    cropAnalyzed: "Crop analyzed",
    mode: "Mode",
    mlModelAnalysis: "ML model analysis",
    demoMode: "Demo mode",
    status: "Status",
    severity: "Severity",
    recommendation: "Recommendation",
    topPredictions: "Top Predictions",
    confidenceMargin: "Confidence margin (Top1-Top2)",
    whyVerification: "Why verification is needed",
    demo02: "Demo 02",
    weatherOutlook: "Weather Outlook",
    weatherSimulate: "Enter a location name and fetch a quick 3-day farm advisory from live data.",
    location: "Location",
    locationHint: "E.g., Delhi, Mumbai, Bangalore",
    getWeather: "Get Weather",
    demo03: "Demo 03",
    soilTool: "Soil Carbon & Fertility Analysis",
    soilSimulate: "Input soil test values and get major insights on fertility, water stress, and corrective actions.",
    fertilityScore: "Fertility Score",
    waterRisk: "Water Risk",
    nutrientRisk: "Nutrient Risk",
    yieldOutlook: "Yield Outlook",
    majorInsights: "Major Insights",
    majorDrivers: "Major Drivers",
    recommendations: "Recommendations",
    section02: "Field Snapshot",
    section02Title: "One screen for three high-impact farm checks.",
    leafScanTitle: "Leaf scan demo",
    weatherTitle: "Weather outlook",
    soilTitle: "Soil intelligence",
    leafScanDesc: "Select a crop, upload a leaf image, and review a structured disease summary.",
    weatherDesc: "Generate a quick three-day forecast card with rainfall and work advice.",
    soilPanelDesc: "Input soil values and get major fertility, water, and nutrient risk insights instantly.",
    selectLanguage: "Language"
  },
  es: {
    appName: "Leaflens",
    home: "Inicio",
    services: "Servicios",
    soil: "Suelo",
    about: "Acerca de",
    heroKicker: "Demo de agricultura de precisión para agricultores indios",
    heroTitle: "Detecta enfermedades de cultivos más rápido y planifica el trabajo de campo con más confianza.",
    heroText: "Leaflens reúne el cribado de síntomas de cultivos y orientación meteorológica simple en una interfaz clara y fácil de usar para móviles para que los agricultores revisen lo que ven en el campo y decidan qué hacer a continuación.",
    tryDemo: "Prueba Demo",
    seeProjectScope: "Ver Alcance del Proyecto",
    platform: "Plataforma",
    platformTitle: "Construido alrededor de los tres controles que los cultivadores buscan primero",
    platformCopy: "Esta versión sigue siendo una demostración frontal, pero la interfaz se siente más cercana a un producto real con flujos de trabajo de enfermedades, clima y suelo diseñados para decisiones rápidas en el campo.",
    diseaseDetection: "Detección de Enfermedades",
    leafSymptomScreening: "Cribado de síntomas de hojas",
    leafSymptomDesc: "Guía al usuario desde la selección del cultivo hasta la carga de imagen con una tarjeta de resultado enfocada y consejos de tratamiento prácticos.",
    weatherPlanning: "Planificación Meteorológica",
    fieldReadyForecast: "Panel de previsión listo para el campo",
    forecastDesc: "Resumir temperatura, probabilidad de lluvia y una breve recomendación para los próximos tres días.",
    soilAnalysis: "Análisis de Suelo",
    dataDrivernSoil: "Información sobre suelo basada en datos",
    soilDesc: "Analiza pH, NPK, humedad, carbono orgánico y valores climáticos para obtener puntuación de fertilidad y acciones correctivas principales.",
    demo01: "Demo 01",
    detectCropDisease: "Detectar Enfermedad de Cultivos",
    interviewMode: "Modo Entrevista",
    detectSimulate: "Simula un agricultor cargando una imagen de hoja y recibiendo una tarjeta de diagnóstico clara con contexto de cultivo y consejos de próximos pasos.",
    selectCrop: "Seleccionar Cultivo",
    uploadLeafPhoto: "Cargar Foto de Hoja",
    analyzeImage: "Analizar Imagen",
    cropLimitNote: "La lista de cultivos se limita a lo que su modelo ML actual admite.",
    noImageSelected: "Aún no se ha seleccionado ninguna imagen.",
    selectedImage: "Imagen seleccionada",
    healthCheckMessage: "Comprobando estado de ML API...",
    mlApiHealth: "Salud de API ML",
    recheckApi: "Recomprobar API",
    checking: "Comprobando...",
    online: "En línea",
    wakingUp: "Despertando",
    backendReachable: "El backend es accesible y está listo para análisis de imágenes.",
    renderWakingUp: "El backend de Render se está despertando. Reintentar en unos 30-60 segundos.",
    detectionResult: "Resultado de Detección",
    diseaseNotDetected: "Enfermedad no detectada",
    diseaseDetected: "Enfermedad detectada",
    cropAnalyzed: "Cultivo analizado",
    mode: "Modo",
    mlModelAnalysis: "Análisis de modelo ML",
    demoMode: "Modo demo",
    status: "Estado",
    severity: "Severidad",
    recommendation: "Recomendación",
    topPredictions: "Predicciones Principales",
    confidenceMargin: "Margen de confianza (Top1-Top2)",
    whyVerification: "Por qué se necesita verificación",
    demo02: "Demo 02",
    weatherOutlook: "Perspectiva Meteorológica",
    weatherSimulate: "Ingrese un nombre de ubicación y obtenga un rápido consejo de granja de 3 días a partir de datos en vivo.",
    location: "Ubicación",
    locationHint: "p. ej., Delhi, Mumbai, Bangalore",
    getWeather: "Obtener Clima",
    demo03: "Demo 03",
    soilTool: "Análisis de Carbono y Fertilidad del Suelo",
    soilSimulate: "Ingrese valores de prueba de suelo y obtenga información importante sobre fertilidad, estrés hídrico y acciones correctivas.",
    fertilityScore: "Puntuación de Fertilidad",
    waterRisk: "Riesgo de Agua",
    nutrientRisk: "Riesgo de Nutrientes",
    yieldOutlook: "Perspectiva de Rendimiento",
    majorInsights: "Información Principal",
    majorDrivers: "Factores Principales",
    recommendations: "Recomendaciones",
    section02: "Snapshot de Campo",
    section02Title: "Una pantalla para tres controles de granja de alto impacto.",
    leafScanTitle: "Demo de escaneo de hojas",
    weatherTitle: "Perspectiva meteorológica",
    soilTitle: "Inteligencia del suelo",
    leafScanDesc: "Seleccione un cultivo, cargue una imagen de hoja y revise un resumen de enfermedad estructurado.",
    weatherDesc: "Genere una tarjeta de previsión de 3 días con lluvia y consejos de trabajo.",
    soilPanelDesc: "Ingrese valores de suelo y obtenga información instantánea sobre fertilidad, agua y riesgo de nutrientes.",
    selectLanguage: "Idioma"
  },
  fr: {
    appName: "Leaflens",
    home: "Accueil",
    services: "Services",
    soil: "Sol",
    about: "À propos",
    heroKicker: "Démo d'agriculture de précision pour les agriculteurs indiens",
    heroTitle: "Détectez les maladies des cultures plus rapidement et planifiez les travaux des champs en toute confiance.",
    heroText: "Leaflens réunit le dépistage des symptômes des cultures et des conseils météorologiques simples dans une interface claire et conviviale pour mobile afin que les agriculteurs examinent ce qu'ils voient dans le champ et décident quoi faire ensuite.",
    tryDemo: "Essayer la démo",
    seeProjectScope: "Voir la portée du projet",
    platform: "Plateforme",
    platformTitle: "Construit autour des trois contrôles que les agriculteurs recherchent en premier",
    platformCopy: "Cette version est toujours une démo frontale, mais l'interface se rapproche davantage d'un produit réel avec des flux de travail de maladie, météo et sol conçus pour des décisions rapides sur le terrain.",
    diseaseDetection: "Détection des maladies",
    leafSymptomScreening: "Dépistage des symptômes des feuilles",
    leafSymptomDesc: "Guidez l'utilisateur de la sélection des cultures au téléchargement d'images avec une carte de résultats ciblée et des conseils de traitement pratiques.",
    weatherPlanning: "Planification météorologique",
    fieldReadyForecast: "Panneau de prévision prêt pour le champ",
    forecastDesc: "Résumer la température, la probabilité de précipitations et une brève recommandation pour les trois prochains jours.",
    soilAnalysis: "Analyse du sol",
    dataDrivernSoil: "Informations sur le sol basées sur les données",
    soilDesc: "Analysez le pH, NPK, l'humidité, le carbone organique et les valeurs climatiques pour obtenir un score de fertilité et des actions correctives majeures.",
    demo01: "Démo 01",
    detectCropDisease: "Détecter les maladies des cultures",
    interviewMode: "Mode Entretien",
    detectSimulate: "Simulez un agriculteur téléchargeant une image de feuille et recevant une carte de diagnostic claire avec contexte de culture et conseils pour les prochaines étapes.",
    selectCrop: "Sélectionner une culture",
    uploadLeafPhoto: "Télécharger une photo de feuille",
    analyzeImage: "Analyser l'image",
    cropLimitNote: "La liste des cultures est limitée à ce que votre modèle ML actuel supporte.",
    noImageSelected: "Aucune image sélectionnée pour l'instant.",
    selectedImage: "Image sélectionnée",
    healthCheckMessage: "Vérification du statut de l'API ML...",
    mlApiHealth: "Santé de l'API ML",
    recheckApi: "Revérifier l'API",
    checking: "Vérification en cours...",
    online: "En ligne",
    wakingUp: "Réveil en cours",
    backendReachable: "Le backend est accessible et prêt pour l'analyse d'images.",
    renderWakingUp: "Le backend Render se réveille. Réessayez dans 30 à 60 secondes.",
    detectionResult: "Résultat de la détection",
    diseaseNotDetected: "Maladie non détectée",
    diseaseDetected: "Maladie détectée",
    cropAnalyzed: "Culture analysée",
    mode: "Mode",
    mlModelAnalysis: "Analyse du modèle ML",
    demoMode: "Mode démo",
    status: "Statut",
    severity: "Gravité",
    recommendation: "Recommandation",
    topPredictions: "Prédictions principales",
    confidenceMargin: "Marge de confiance (Top1-Top2)",
    whyVerification: "Pourquoi la vérification est nécessaire",
    demo02: "Démo 02",
    weatherOutlook: "Perspectives météorologiques",
    weatherSimulate: "Entrez un nom de lieu et obtenez un rapide conseil agricole de 3 jours à partir de données en direct.",
    location: "Lieu",
    locationHint: "Ex. Delhi, Mumbai, Bangalore",
    getWeather: "Obtenir la météo",
    demo03: "Démo 03",
    soilTool: "Analyse du carbone et de la fertilité du sol",
    soilSimulate: "Entrez les valeurs du test de sol et obtenez des informations importantes sur la fertilité, le stress hydrique et les actions correctives.",
    fertilityScore: "Score de fertilité",
    waterRisk: "Risque d'eau",
    nutrientRisk: "Risque de nutriments",
    yieldOutlook: "Perspectives de rendement",
    majorInsights: "Informations majeures",
    majorDrivers: "Facteurs majeurs",
    recommendations: "Recommandations",
    section02: "Aperçu du terrain",
    section02Title: "Un écran pour trois vérifications agricoles à fort impact.",
    leafScanTitle: "Démo de numérisation des feuilles",
    weatherTitle: "Perspectives météorologiques",
    soilTitle: "Intelligence du sol",
    leafScanDesc: "Sélectionnez une culture, téléchargez une image de feuille et examinez un résumé structuré de la maladie.",
    weatherDesc: "Générez une carte de prévision de 3 jours avec précipitations et conseils de travail.",
    soilPanelDesc: "Entrez les valeurs du sol et obtenez instantanément des informations majeures sur la fertilité, l'eau et le risque de nutriments.",
    selectLanguage: "Langue"
  },
  hi: {
    appName: "Leaflens",
    home: "होम",
    services: "सेवाएं",
    soil: "मिट्टी",
    about: "के बारे में",
    heroKicker: "भारतीय किसानों के लिए सटीक खेती डेमो",
    heroTitle: "फसल रोगों का तेजी से पता लगाएं और अधिक आत्मविश्वास के साथ खेती का काम योजना बनाएं।",
    heroText: "Leaflens फसल के लक्षणों की जांच और सरल मौसम मार्गदर्शन को एक स्पष्ट मोबाइल-अनुकूल इंटरफेस में लाता है ताकि किसान देख सकें कि वे खेत में क्या देख रहे हैं और अगला क्या करें।",
    tryDemo: "डेमो आज़माएं",
    seeProjectScope: "प्रोजेक्ट स्कोप देखें",
    platform: "प्लेटफॉर्म",
    platformTitle: "किसानों द्वारा पहले मांगी जाने वाली तीन जांचों के आसपास निर्मित",
    platformCopy: "यह संस्करण अभी भी एक फ्रंटएंड डेमो है, लेकिन इंटरफेस तेजी से खेत के निर्णयों के लिए डिज़ाइन किए गए रोग, मौसम और मिट्टी के वर्कफ़्लो के साथ एक वास्तविक उत्पाद के करीब महसूस करता है।",
    diseaseDetection: "रोग पहचान",
    leafSymptomScreening: "पत्ती के लक्षण जांच",
    leafSymptomDesc: "उपयोगकर्ता को फसल चयन से लेकर छवि अपलोड तक एक केंद्रित परिणाम कार्ड और व्यावहारिक उपचार सलाह के साथ गाइड करें।",
    weatherPlanning: "मौसम योजना",
    fieldReadyForecast: "खेत के लिए तैयार पूर्वानुमान पैनल",
    forecastDesc: "तापमान, वर्षा की संभावना और अगले तीन दिनों के लिए एक संक्षिप्त सुझाव को सारांश दें।",
    soilAnalysis: "मिट्टी विश्लेषण",
    dataDrivernSoil: "डेटा-संचालित मिट्टी अंतर्दृष्टि",
    soilDesc: "उर्वरता स्कोर और प्रमुख सुधारात्मक कार्यों के लिए pH, NPK, नमी, जैविक कार्बन और जलवायु मानों का विश्लेषण करें।",
    demo01: "डेमो 01",
    detectCropDisease: "फसल रोग का पता लगाएं",
    interviewMode: "साक्षात्कार मोड",
    detectSimulate: "एक किसान को पत्ती की छवि अपलोड करने और फसल संदर्भ और अगली चरण सलाह के साथ एक स्पष्ट निदान कार्ड प्राप्त करने का अनुकरण करें।",
    selectCrop: "फसल चुनें",
    uploadLeafPhoto: "पत्ती फोटो अपलोड करें",
    analyzeImage: "छवि का विश्लेषण करें",
    cropLimitNote: "फसल सूची इस तक सीमित है कि आपका वर्तमान ML मॉडल क्या समर्थन करता है।",
    noImageSelected: "अभी तक कोई छवि नहीं चुनी गई है।",
    selectedImage: "चयनित छवि",
    healthCheckMessage: "ML API स्थिति की जांच की जा रही है...",
    mlApiHealth: "ML API स्वास्थ्य",
    recheckApi: "API को फिर से जांचें",
    checking: "जांच की जा रही है...",
    online: "ऑनलाइन",
    wakingUp: "जाग रहा है",
    backendReachable: "बैकएंड पहुंचने योग्य है और छवि विश्लेषण के लिए तैयार है।",
    renderWakingUp: "Render बैकएंड जाग रहा है। लगभग 30-60 सेकंड में दोबारा कोशिश करें।",
    detectionResult: "पहचान परिणाम",
    diseaseNotDetected: "रोग का पता नहीं चला",
    diseaseDetected: "रोग का पता चला",
    cropAnalyzed: "फसल का विश्लेषण किया गया",
    mode: "मोड",
    mlModelAnalysis: "ML मॉडल विश्लेषण",
    demoMode: "डेमो मोड",
    status: "स्थिति",
    severity: "गंभीरता",
    recommendation: "अनुशंसा",
    topPredictions: "शीर्ष भविष्यवाणियां",
    confidenceMargin: "आत्मविश्वास मार्जिन (Top1-Top2)",
    whyVerification: "सत्यापन क्यों आवश्यक है",
    demo02: "डेमो 02",
    weatherOutlook: "मौसम दृष्टिकोण",
    weatherSimulate: "एक स्थान का नाम दर्ज करें और लाइव डेटा से 3-दिन की त्वरित खेती सलाह प्राप्त करें।",
    location: "स्थान",
    locationHint: "जैसे दिल्ली, मुंबई, बेंगलुरु",
    getWeather: "मौसम प्राप्त करें",
    demo03: "डेमो 03",
    soilTool: "मिट्टी कार्बन और उर्वरता विश्लेषण",
    soilSimulate: "मिट्टी परीक्षण मान दर्ज करें और उर्वरता, जल तनाव और सुधारात्मक कार्यों के बारे में प्रमुख अंतर्दृष्टि प्राप्त करें।",
    fertilityScore: "उर्वरता स्कोर",
    waterRisk: "जल जोखिम",
    nutrientRisk: "पोषक तत्व जोखिम",
    yieldOutlook: "फसल दृष्टिकोण",
    majorInsights: "प्रमुख अंतर्दृष्टि",
    majorDrivers: "प्रमुख चालक",
    recommendations: "अनुशंसाएं",
    section02: "खेत स्नैपशॉट",
    section02Title: "तीन उच्च प्रभाव वाली खेत जांचों के लिए एक स्क्रीन।",
    leafScanTitle: "पत्ती स्कैन डेमो",
    weatherTitle: "मौसम दृष्टिकोण",
    soilTitle: "मिट्टी बुद्धिमत्ता",
    leafScanDesc: "एक फसल चुनें, पत्ती की छवि अपलोड करें और एक संरचित रोग सारांश की समीक्षा करें।",
    weatherDesc: "वर्षा और काम सलाह के साथ 3-दिन का पूर्वानुमान कार्ड तैयार करें।",
    soilPanelDesc: "मिट्टी मान दर्ज करें और उर्वरता, जल और पोषक तत्व जोखिम से संबंधित तुरंत प्रमुख अंतर्दृष्टि प्राप्त करें।",
    selectLanguage: "भाषा"
  }
};

function getWeatherLabel(code) {
  return weatherCodeLabels[code] || "Variable weather";
}

function getFarmingAdvice(maxTemp, minTemp, rainChance, weatherCode) {
  if (weatherCode >= 95) {
    return "Thunderstorm risk expected. Avoid open-field operations during lightning hours.";
  }
  if (rainChance >= 70) {
    return "High rain chance. Delay spraying and protect inputs and harvested produce.";
  }
  if (rainChance >= 40) {
    return "Possible showers. Keep drainage channels open and plan flexible fieldwork windows.";
  }
  if (maxTemp >= 36) {
    return "Hot conditions expected. Prefer irrigation in early morning or late evening.";
  }
  if (minTemp <= 10) {
    return "Cool night temperatures expected. Protect sensitive seedlings where needed.";
  }
  return "Stable weather expected. Suitable window for routine field monitoring and light operations.";
}

function formatForecastDate(dateString, timeZone) {
  const [year, month, day] = dateString.split("-").map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(dateObj);
  const fullDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone
  }).format(dateObj);

  return { weekday, fullDate };
}

function formatUpdatedTime(timeZone) {
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };

  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-GB", options).format(new Date());
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to reach weather service right now. Please try again.");
  }
  return response.json();
}

async function getLocationDetails(locationName) {
  const query = new URLSearchParams({
    name: locationName,
    count: "1",
    language: "en",
    format: "json"
  });
  const data = await fetchJson(`${geocodeEndpoint}?${query.toString()}`);

  if (!data.results || data.results.length === 0) {
    throw new Error("Location not found. Try a city name like Delhi, Pune, or Jaipur.");
  }

  const bestMatch = data.results[0];
  const placeParts = [bestMatch.name, bestMatch.admin1, bestMatch.country].filter(Boolean);

  return {
    latitude: bestMatch.latitude,
    longitude: bestMatch.longitude,
    timeZone: bestMatch.timezone || "Asia/Kolkata",
    displayName: placeParts.join(", ")
  };
}

async function getForecast(latitude, longitude, timeZone) {
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: timeZone,
    forecast_days: "3"
  });
  const data = await fetchJson(`${forecastEndpoint}?${query.toString()}`);

  if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
    throw new Error("Forecast data is currently unavailable for this location.");
  }

  return data.daily;
}

function getDiseaseInsight(result) {
  if (!result?.isDetected) {
    return {
      heading: "Healthy Leaf Guidance",
      points: [
        "Keep weekly leaf checks to catch early symptoms before spread.",
        "Avoid overwatering and improve airflow around the crop canopy.",
        "Apply preventive bio-fungicide during humid or rainy periods."
      ]
    };
  }

  if (String(result.severity).toLowerCase() === "high") {
    return {
      heading: "Priority Treatment Plan",
      points: [
        "Isolate visibly infected plants or leaves to reduce cross-field spread.",
        "Start recommended fungicide protocol immediately and repeat as advised.",
        "Recheck the field in 48-72 hours and document progression with photos."
      ]
    };
  }

  return {
    heading: "Suggested Field Actions",
    points: [
      "Remove affected leaves and sanitize tools after each row.",
      "Apply targeted treatment in cool hours for better leaf retention.",
      "Review nutrient balance to improve natural disease resistance."
    ]
  };
}

function getSoilBandTone(fertilityBand) {
  const band = String(fertilityBand || "").toLowerCase();
  if (band === "high") {
    return "high";
  }
  if (band === "moderate") {
    return "moderate";
  }
  return "low";
}

function classifyLevel(value, low, high) {
  if (value < low) {
    return "low";
  }
  if (value > high) {
    return "high";
  }
  return "optimal";
}

function buildClientSoilAnalysis(rawInputs) {
  const ph = Number(rawInputs.ph || 0);
  const nitrogen = Number(rawInputs.nitrogen || 0);
  const phosphorus = Number(rawInputs.phosphorus || 0);
  const potassium = Number(rawInputs.potassium || 0);
  const moisture = Number(rawInputs.moisture || 0);
  const organicCarbon = Number(rawInputs.organicCarbon || 0);
  const temperature = Number(rawInputs.temperature || 0);
  const rainfall = Number(rawInputs.rainfall || 0);

  const levels = {
    nitrogen: classifyLevel(nitrogen, 40, 120),
    phosphorus: classifyLevel(phosphorus, 20, 60),
    potassium: classifyLevel(potassium, 80, 220),
    organicCarbon: classifyLevel(organicCarbon, 0.7, 1.5)
  };

  const penalties = [];

  if (ph < 6.0) {
    penalties.push([12, "Acidic soil may reduce nutrient uptake."]);
  } else if (ph > 7.8) {
    penalties.push([10, "Alkaline pH can lock phosphorus and micronutrients."]);
  }

  if (levels.nitrogen === "low") {
    penalties.push([16, "Nitrogen is low, reducing vegetative growth potential."]);
  } else if (levels.nitrogen === "high") {
    penalties.push([6, "Nitrogen is high; monitor excess foliage and pest pressure."]);
  }

  if (levels.phosphorus === "low") {
    penalties.push([14, "Phosphorus is low, affecting root development and flowering."]);
  } else if (levels.phosphorus === "high") {
    penalties.push([6, "Phosphorus is high; avoid unnecessary DAP applications."]);
  }

  if (levels.potassium === "low") {
    penalties.push([12, "Potassium is low, increasing stress and lodging risk."]);
  } else if (levels.potassium === "high") {
    penalties.push([5, "Potassium is high; rebalance future fertilizer schedule."]);
  }

  if (levels.organicCarbon === "low") {
    penalties.push([11, "Low organic carbon indicates poor soil structure and biology."]);
  }

  if (moisture < 30) {
    penalties.push([12, "Soil moisture is low and may limit nutrient availability."]);
  } else if (moisture > 75) {
    penalties.push([9, "Soil moisture is high and can increase root disease risk."]);
  }

  if (temperature > 35) {
    penalties.push([7, "High soil temperature can stress roots and microbial activity."]);
  } else if (temperature < 12) {
    penalties.push([5, "Low soil temperature can slow nutrient mineralization."]);
  }

  if (rainfall > 180) {
    penalties.push([6, "Very high rainfall may cause nutrient leaching."]);
  }

  const totalPenalty = penalties.reduce((sum, item) => sum + item[0], 0);
  const fertilityScore = Number(Math.max(18, Math.min(99, 100 - totalPenalty)).toFixed(1));

  const fertilityBand = fertilityScore >= 80 ? "High" : fertilityScore >= 60 ? "Moderate" : "Low";
  const waterRisk = moisture < 30 ? "Drought Stress" : moisture > 75 || rainfall > 140 ? "Waterlogging Risk" : "Low";
  const lowCount = Object.values(levels).filter((item) => item === "low").length;
  const highCount = Object.values(levels).filter((item) => item === "high").length;
  const nutrientRisk = lowCount >= 2 ? "Nutrient Deficiency Risk" : highCount >= 2 ? "Nutrient Excess Risk" : "Balanced";

  const recommendations = [];
  if (ph < 6) recommendations.push("Apply lime gradually to correct acidic pH.");
  if (ph > 7.8) recommendations.push("Use gypsum and organic matter to improve alkaline soil availability.");
  if (levels.nitrogen === "low") recommendations.push("Increase nitrogen in split applications based on crop stage.");
  if (levels.phosphorus === "low") recommendations.push("Apply phosphorus near root zone for better early uptake.");
  if (levels.potassium === "low") recommendations.push("Supplement potash to improve stress tolerance and plant strength.");
  if (levels.organicCarbon === "low") recommendations.push("Add compost or FYM to improve soil carbon and structure.");
  if (waterRisk === "Drought Stress") recommendations.push("Use mulching and shorter irrigation intervals to reduce water stress.");
  if (waterRisk === "Waterlogging Risk") recommendations.push("Improve drainage before heavy rain and avoid fertilizer loss.");
  if (!recommendations.length) recommendations.push("Soil is relatively stable; maintain schedule and retest after 45-60 days.");

  const majorDrivers = penalties.slice(0, 4).map((item) => item[1]);
  if (!majorDrivers.length) {
    majorDrivers.push("Soil parameters are within a stable operational range.");
  }

  return {
    crop: rawInputs.crop || "General Crop",
    fertility_score: fertilityScore,
    fertility_band: fertilityBand,
    water_risk: waterRisk,
    nutrient_risk: nutrientRisk,
    yield_outlook:
      fertilityScore >= 75
        ? "Good yield potential if disease and weather are managed well."
        : fertilityScore >= 60
          ? "Moderate yield potential; targeted nutrient corrections can improve output."
          : "Yield is at risk without immediate nutrient and water management adjustments.",
    major_insights: [
      `Estimated soil fertility index: ${fertilityScore}/100 (${fertilityBand}).`,
      `Primary nutrient status: N=${levels.nitrogen}, P=${levels.phosphorus}, K=${levels.potassium}.`,
      `Water condition: ${waterRisk} based on moisture ${moisture}% and rainfall ${rainfall} mm.`,
      `Organic carbon is ${levels.organicCarbon} at ${organicCarbon}% impacting soil structure and microbial activity.`
    ],
    major_drivers: majorDrivers,
    recommendations
  };
}

function App() {
  const [language, setLanguage] = useState("en");
  const t = translations[language] || translations.en;

  const [menuOpen, setMenuOpen] = useState(false);
  const [crop, setCrop] = useState("Tomato");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("No image selected yet.");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [location, setLocation] = useState("");
  const [weatherCards, setWeatherCards] = useState([]);
  const [weatherMetaInfo, setWeatherMetaInfo] = useState("Live forecast powered by Open-Meteo.");
  const [weatherStatus, setWeatherStatus] = useState(null);
  const [soilInputs, setSoilInputs] = useState({
    crop: "Tomato",
    ph: "6.7",
    nitrogen: "90",
    phosphorus: "42",
    potassium: "160",
    moisture: "48",
    organicCarbon: "1.1",
    temperature: "29",
    rainfall: "65"
  });
  const [soilStatus, setSoilStatus] = useState(null);
  const [soilResult, setSoilResult] = useState(null);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [demoUploadStep, setDemoUploadStep] = useState(1);
  const [apiHealth, setApiHealth] = useState({
    state: "checking",
    label: "Checking",
    message: "Checking ML API status..."
  });

  const supportedModelCrops = [
    "Apple",
    "Blueberry",
    "Cherry",
    "Maize",
    "Grape",
    "Orange",
    "Peach",
    "Bell Pepper",
    "Potato",
    "Raspberry",
    "Soybean",
    "Squash",
    "Strawberry",
    "Tomato"
  ];

  const [detectionStatus, setDetectionStatus] = useState(null);

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return "";
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const checkApiHealth = async (showChecking = false) => {
    if (showChecking) {
      setApiHealth({ state: "checking", label: "Checking", message: "Checking ML API status..." });
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: "GET",
        signal: controller.signal
      });

      if (response.ok) {
        setApiHealth({
          state: "online",
          label: "Online",
          message: "Backend is reachable and ready for image analysis."
        });
        return;
      }

      if (response.status === 503) {
        setApiHealth({
          state: "degraded",
          label: "Waking Up",
          message: "Render backend is waking up. Retry in about 30-60 seconds."
        });
        return;
      }

      setApiHealth({
        state: "offline",
        label: "Unavailable",
        message: `Backend responded with status ${response.status}.`
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setApiHealth({
          state: "offline",
          label: "Timeout",
          message: "Health check timed out. Verify Render service status and network."
        });
      } else {
        setApiHealth({
          state: "offline",
          label: "Offline",
          message: "Cannot reach ML API endpoint."
        });
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    checkApiHealth(true);
    const intervalId = window.setInterval(() => {
      checkApiHealth(false);
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleDiseaseSubmit = (event) => {
    event.preventDefault();
    setDetectionStatus({ type: "loading", message: "Analyzing image with ML model..." });
    setDiseaseResult(null);

    if (!selectedFile) {
      setDetectionStatus({ type: "error", message: "Please upload an image first." });
      return;
    }

    // On hosted frontend, if custom API is not configured, use default Render backend.
    if (isGitHubPagesHost && !hasConfiguredExternalApi) {
      setDetectionStatus({
        type: "info",
        message: "Using default Render backend for disease detection."
      });
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("crop", crop);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    fetch(`${apiBaseUrl}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          let payload = null;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }

          if (response.status === 503) {
            throw new Error(
              "Render backend is waking up or unavailable (503). Wait 30-60 seconds and try Analyze Image again."
            );
          }

          throw new Error(payload?.error || `API request failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setDiseaseResult(null);
          setDetectionStatus({ type: "error", message: data.error });
          return;
        }

        // Parse disease name and severity
        const diseaseName = data.disease.replace(/_/g, " ");
        const isHealthy = diseaseName.toLowerCase().includes("healthy");
        const confidence = data.confidence.toFixed(2);
        const needsReview = Boolean(data.needs_review);
        const uncertaintyReasons = data.uncertainty_reasons || [];
        const confidenceMargin = typeof data.confidence_margin === "number"
          ? data.confidence_margin.toFixed(2)
          : "N/A";

        // Map to severity levels
        let severity = "Moderate";
        if (isHealthy) {
          severity = "None";
        } else if (diseaseName.includes("Blast") || diseaseName.includes("Blight")) {
          severity = "High";
        }

        // Create result payload
        const resultPayload = {
          name: diseaseName,
          desc: needsReview
            ? `Model predicted ${diseaseName} (${confidence}%), but this result needs verification.`
            : `ML model detected: ${diseaseName} with ${confidence}% confidence.`,
          severity,
          advice: needsReview
            ? "Retake a clear leaf-only photo and verify with an expert before treatment decisions."
            : isHealthy
              ? "Continue regular monitoring, balanced irrigation, and preventive care."
              : "Please consult with an agronomist for detailed treatment recommendations.",
          crop: [crop],
          statusLabel: isHealthy ? "Disease not detected" : "Disease detected",
          confidence: parseFloat(confidence),
          topPredictions: data.top_3 || [],
          needsReview,
          uncertaintyReasons,
          confidenceMargin
        };

        setDiseaseResult({
          ...resultPayload,
          imageSource: previewUrl,
          isDetected: !isHealthy,
          imageAlt: `${crop} leaf uploaded for analysis`
        });
        setDetectionStatus(null);
      })
      .catch((error) => {
        let errorMessage = "Unable to analyze image right now. Please try again.";

        if (error instanceof Error && error.name === "AbortError") {
          errorMessage = "Image analysis timed out. Please retry with a clearer, smaller image.";
        } else if (error instanceof TypeError) {
          errorMessage =
            "Could not reach the ML API. Check backend status and verify VITE_API_BASE_URL points to a live HTTPS endpoint.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setDiseaseResult(null);
        setDetectionStatus({ type: "error", message: errorMessage });
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  };

  const handleWeatherSubmit = async (event) => {
    event.preventDefault();

    const locationName = location.trim() || "Delhi";
    setWeatherStatus({ type: "loading", message: `Fetching live forecast for ${locationName}...` });

    try {
      const place = await getLocationDetails(locationName);
      const dailyData = await getForecast(place.latitude, place.longitude, place.timeZone);

      const cards = dailyData.time.map((day, dayIndex) => {
        const maxTemp = Math.round(dailyData.temperature_2m_max[dayIndex]);
        const minTemp = Math.round(dailyData.temperature_2m_min[dayIndex]);
        const rainChance = Math.round(dailyData.precipitation_probability_max[dayIndex] ?? 0);
        const weatherCode = dailyData.weathercode[dayIndex];
        const conditionLabel = getWeatherLabel(weatherCode);
        const advice = getFarmingAdvice(maxTemp, minTemp, rainChance, weatherCode);
        const { weekday, fullDate } = formatForecastDate(day, place.timeZone);

        return {
          weekday,
          fullDate,
          maxTemp,
          minTemp,
          rainChance,
          conditionLabel,
          advice,
          delayMs: dayIndex * 120
        };
      });

      setWeatherCards(cards);
      setWeatherStatus(null);
      setWeatherMetaInfo(`Forecast for ${place.displayName} (${place.timeZone}) • Updated ${formatUpdatedTime(place.timeZone)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch forecast right now.";
      setWeatherCards([]);
      setWeatherStatus({ type: "error", message });
      setWeatherMetaInfo("Live forecast powered by Open-Meteo.");
    }
  };

  const handleSoilInputChange = (event) => {
    const { name, value } = event.target;
    setSoilInputs((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSoilSubmit = async (event) => {
    event.preventDefault();
    setSoilStatus({ type: "loading", message: "Analyzing soil profile and generating key insights..." });

    // GitHub Pages is static hosting; use built-in analyzer unless an external API URL is configured.
    if (isGitHubPagesHost && !import.meta.env.VITE_API_BASE_URL) {
      setSoilResult(buildClientSoilAnalysis(soilInputs));
      setSoilStatus({
        type: "info",
        message: "Built-in website analysis mode is active on GitHub Pages."
      });
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/analyze-soil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(soilInputs)
      });

      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Soil analysis failed. Check API status on port 5000.");
      }

      setSoilResult(payload.analysis);
      setSoilStatus(null);
    } catch (error) {
      // Fallback keeps the feature usable if API is unreachable.
      setSoilResult(buildClientSoilAnalysis(soilInputs));
      const message = error instanceof Error ? error.message : "Unable to analyze soil profile right now.";
      setSoilStatus({
        type: "info",
        message: `Live API is currently unreachable (${message}). Showing built-in website analysis.`
      });
    }
  };

  return (
    <>
      <header className="site-header">
        <nav className="container">
          <a className="logo" href="#home" onClick={() => setMenuOpen(false)}>
            {t.appName}
          </a>
          <ul className={`nav-links${menuOpen ? " active" : ""}`}>
            <li>
              <a href="#home" onClick={() => setMenuOpen(false)}>
                {t.home}
              </a>
            </li>
            <li>
              <a href="#services" onClick={() => setMenuOpen(false)}>
                {t.services}
              </a>
            </li>
            <li>
              <a href="#soil-tool" onClick={() => setMenuOpen(false)}>
                {t.soil}
              </a>
            </li>
            <li>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                {t.about}
              </a>
            </li>
          </ul>
          <select
            className="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label={t.selectLanguage}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="hi">हिंदी</option>
          </select>
          <button
            className="mobile-toggle"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero-shell">
            <div className="hero-copy">
              <p className="hero-kicker">{t.heroKicker}</p>
              <h1>{t.heroTitle}</h1>
              <p className="hero-text">
                {t.heroText}
              </p>
              <div className="hero-actions">
                <a href="#services" className="cta-button">
                  {t.tryDemo}
                </a>
                <a href="#about" className="secondary-button">
                  {t.seeProjectScope}
                </a>
              </div>
              <div className="hero-highlights">
                <span>6 crop profiles</span>
                <span>Disease result cards</span>
                <span>3-day forecast panel</span>
                <span>Soil insight dashboard</span>
              </div>
            </div>
            <aside className="hero-panel">
              <div className="hero-panel-card">
                <p className="panel-label">Field Snapshot</p>
                <h2>One screen for three high-impact farm checks.</h2>
                <div className="snapshot-list">
                  <div className="snapshot-item">
                    <span className="snapshot-value">01</span>
                    <div>
                      <h3>{t.leafScanTitle}</h3>
                      <p>{t.leafScanDesc}</p>
                    </div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-value">02</span>
                    <div>
                      <h3>{t.weatherTitle}</h3>
                      <p>{t.weatherDesc}</p>
                    </div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-value">03</span>
                    <div>
                      <h3>{t.soilTitle}</h3>
                      <p>{t.soilPanelDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="services" className="services-section">
          <div className="container">
            <div className="section-heading">
              <p className="section-label">{t.platform}</p>
              <h2 className="section-title">{t.platformTitle}</h2>
              <p className="section-copy">
                {t.platformCopy}
              </p>
            </div>

            <div className="services-grid">
              <article className="service-card">
                <div className="service-icon">🌿</div>
                <p className="service-tag">{t.diseaseDetection}</p>
                <h3>{t.leafSymptomScreening}</h3>
                <p>
                  {t.leafSymptomDesc}
                </p>
              </article>
              <article className="service-card">
                <div className="service-icon">☁️</div>
                <p className="service-tag">{t.weatherPlanning}</p>
                <h3>{t.fieldReadyForecast}</h3>
                <p>{t.forecastDesc}</p>
              </article>
              <article className="service-card">
                <div className="service-icon">🧪</div>
                <p className="service-tag">{t.soilAnalysis}</p>
                <h3>{t.dataDrivernSoil}</h3>
                <p>
                  {t.soilDesc}
                </p>
              </article>
            </div>

            <div className="demo-grid">
              <section className="tool-panel" aria-labelledby="detection-heading">
                <div className="panel-heading">
                  <p className="panel-label">{t.demo01}</p>
                  <h3 className="demo-title" id="detection-heading">
                    {t.detectCropDisease}
                  </h3>
                  <button
                    type="button"
                    className={`interview-toggle${isInterviewMode ? " active" : ""}`}
                    onClick={() => {
                      setIsInterviewMode((prev) => !prev);
                      setDemoUploadStep(1);
                      setDiseaseResult(null);
                    }}
                  >
                    Interview Mode: {isInterviewMode ? "ON" : "OFF"}
                  </button>
                  <p className="panel-copy">
                    Simulate a farmer uploading a leaf image and receiving a clear diagnosis card with crop context and
                    next-step advice.
                  </p>
                  <div className="api-health-card" role="status" aria-live="polite">
                    <div className="api-health-row">
                      <p className="api-health-label">ML API Health</p>
                      <span className={`api-health-pill api-health-pill-${apiHealth.state}`}>{apiHealth.label}</span>
                    </div>
                    <p className="api-health-message">{apiHealth.message}</p>
                    <button
                      type="button"
                      className="api-health-action"
                      onClick={() => checkApiHealth(true)}
                      disabled={apiHealth.state === "checking"}
                    >
                      {apiHealth.state === "checking" ? "Checking..." : "Recheck API"}
                    </button>
                  </div>
                </div>

                <form className="detection-form" onSubmit={handleDiseaseSubmit}>
                  <div className="form-group">
                    <label htmlFor="crop-type">{t.selectCrop}</label>
                    <select id="crop-type" value={crop} onChange={(event) => setCrop(event.target.value)}>
                      {supportedModelCrops.map((cropName) => (
                        <option key={cropName}>{cropName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="image-upload">{t.uploadLeafPhoto}</label>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedFile(file);
                        setUploadStatus(file ? `${t.selectedImage}: ${file.name}` : t.noImageSelected);
                      }}
                    />
                    <p className="form-hint">
                      {t.cropLimitNote}
                    </p>
                    <p className="upload-status">{uploadStatus}</p>
                  </div>
                  <div className="form-group">
                    <button type="submit">{t.analyzeImage}</button>
                  </div>
                </form>

                {detectionStatus && (
                  <div className={`weather-status weather-status-${detectionStatus.type}`} style={{ marginTop: "20px" }}>
                    {detectionStatus.message}
                  </div>
                )}

                {diseaseResult && (
                  <div className="result-card" data-severity={diseaseResult.severity.toLowerCase()} style={{ display: "block" }}>
                    <div className="result-header">
                      <div>
                        <p className="result-label">Detection Result</p>
                        <h3 id="disease-title">{diseaseResult.name}</h3>
                      </div>
                      <span className="result-pill">
                        {diseaseResult.needsReview
                          ? "Needs Verification"
                          : diseaseResult.confidence
                            ? `${diseaseResult.confidence}% Confident`
                            : "ML Analysis"}
                      </span>
                    </div>
                    <p className="result-summary">
                      <strong>Crop analyzed:</strong> {diseaseResult.crop} • <strong>Mode:</strong>{" "}
                      {selectedFile ? "ML model analysis" : "Demo mode"} • <strong>Status:</strong>{" "}
                      {diseaseResult.statusLabel}
                    </p>
                    <div className="result-body">
                      <div className="result-details">
                        <p>{diseaseResult.desc}</p>
                        <p>
                          <strong>Severity:</strong> {diseaseResult.severity}
                        </p>
                        {diseaseResult.topPredictions && diseaseResult.topPredictions.length > 0 && (
                          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e5e5" }}>
                            <p style={{ fontSize: "0.875rem", color: "#666" }}>
                              <strong>Top Predictions:</strong>
                            </p>
                            <p style={{ fontSize: "0.82rem", color: "#666", marginTop: "4px" }}>
                              Confidence margin (Top1-Top2): {diseaseResult.confidenceMargin}%
                            </p>
                            <ul style={{ fontSize: "0.875rem", marginLeft: "12px" }}>
                              {diseaseResult.topPredictions.map((pred, idx) => (
                                <li key={idx}>
                                  {pred.disease.replace(/_/g, " ")} ({pred.confidence.toFixed(2)}%)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {diseaseResult.needsReview && diseaseResult.uncertaintyReasons?.length > 0 && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "10px",
                              borderRadius: "12px",
                              border: "1px solid #f0c36d",
                              background: "#fff8e8"
                            }}
                          >
                            <p style={{ fontSize: "0.875rem", marginBottom: "6px", color: "#7a4b00" }}>
                              <strong>Why verification is needed:</strong>
                            </p>
                            <ul style={{ marginLeft: "12px", fontSize: "0.85rem", color: "#7a4b00" }}>
                              {diseaseResult.uncertaintyReasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p>
                          <strong>Recommendation:</strong> {diseaseResult.advice}
                        </p>
                      </div>
                      <div className="result-side">
                        <img
                          className="disease-img"
                          src={diseaseResult.imageSource}
                          alt={diseaseResult.imageAlt}
                          style={{ display: "block" }}
                        />
                        <div className="disease-insight-card">
                          <p className="disease-insight-title">{getDiseaseInsight(diseaseResult).heading}</p>
                          <ul className="disease-insight-list">
                            {getDiseaseInsight(diseaseResult).points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="tool-panel" aria-labelledby="weather-heading">
                <div className="panel-heading">
                  <p className="panel-label">Demo 02</p>
                  <h3 className="forecast-title" id="weather-heading">
                    Weather Forecast
                  </h3>
                  <p className="panel-copy">
                    Generate a three-day local weather panel with crop-friendly fieldwork guidance.
                  </p>
                </div>

                <form className="weather-form" onSubmit={handleWeatherSubmit}>
                  <div className="form-group">
                    <label htmlFor="location">Your Location</label>
                    <input
                      type="text"
                      id="location"
                      placeholder="Delhi, Punjab, Lucknow..."
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit">Get 3-Day Forecast</button>
                  </div>
                </form>

                <p className="weather-source">{weatherMetaInfo}</p>

                {(weatherStatus || weatherCards.length > 0) && (
                  <div className="weather-grid" style={{ display: "grid" }}>
                    {weatherStatus && (
                      <div className={`weather-status weather-status-${weatherStatus.type}`}>
                        {weatherStatus.message}
                      </div>
                    )}
                    {!weatherStatus &&
                      weatherCards.map((card) => (
                        <div
                          className="weather-card"
                          style={{ animationDelay: `${card.delayMs}ms` }}
                          key={`${card.fullDate}-${card.weekday}`}
                        >
                          <p className="weather-day">{card.weekday}</p>
                          <p className="weather-date">{card.fullDate}</p>
                          <div className="temp">{card.maxTemp}°C</div>
                          <p className="weather-condition">{card.conditionLabel}</p>
                          <div className="weather-meta">
                            <span>Min {card.minTemp}°C</span>
                            <span>Rain {card.rainChance}%</span>
                          </div>
                          <p className="weather-advice">
                            <em>{card.advice}</em>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </section>

              <section id="soil-tool" className="tool-panel" aria-labelledby="soil-heading">
                <div className="panel-heading">
                  <p className="panel-label">Demo 03</p>
                  <h3 className="forecast-title" id="soil-heading">
                    Soil Analysis and Major Insights
                  </h3>
                  <p className="panel-copy">
                    Enter your soil and field data to estimate fertility level, identify key risks, and get practical
                    recommendations for the next field cycle.
                  </p>
                </div>

                <form className="soil-form" onSubmit={handleSoilSubmit}>
                  <div className="soil-grid-inputs">
                    <div className="form-group">
                      <label htmlFor="soil-crop">Crop</label>
                      <input
                        id="soil-crop"
                        name="crop"
                        type="text"
                        value={soilInputs.crop}
                        onChange={handleSoilInputChange}
                        placeholder="Tomato"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-ph">pH</label>
                      <input
                        id="soil-ph"
                        name="ph"
                        type="number"
                        step="0.1"
                        min="3"
                        max="10"
                        value={soilInputs.ph}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-n">Nitrogen (mg/kg)</label>
                      <input
                        id="soil-n"
                        name="nitrogen"
                        type="number"
                        step="0.1"
                        value={soilInputs.nitrogen}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-p">Phosphorus (mg/kg)</label>
                      <input
                        id="soil-p"
                        name="phosphorus"
                        type="number"
                        step="0.1"
                        value={soilInputs.phosphorus}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-k">Potassium (mg/kg)</label>
                      <input
                        id="soil-k"
                        name="potassium"
                        type="number"
                        step="0.1"
                        value={soilInputs.potassium}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-moisture">Moisture (%)</label>
                      <input
                        id="soil-moisture"
                        name="moisture"
                        type="number"
                        step="0.1"
                        value={soilInputs.moisture}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-carbon">Organic Carbon (%)</label>
                      <input
                        id="soil-carbon"
                        name="organicCarbon"
                        type="number"
                        step="0.01"
                        value={soilInputs.organicCarbon}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-temp">Soil Temp (C)</label>
                      <input
                        id="soil-temp"
                        name="temperature"
                        type="number"
                        step="0.1"
                        value={soilInputs.temperature}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="soil-rain">Rainfall (mm, recent)</label>
                      <input
                        id="soil-rain"
                        name="rainfall"
                        type="number"
                        step="0.1"
                        value={soilInputs.rainfall}
                        onChange={handleSoilInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <button type="submit">Analyze Soil Data</button>
                  </div>
                </form>

                {soilStatus && (
                  <div className={`weather-status weather-status-${soilStatus.type}`} style={{ marginTop: "20px" }}>
                    {soilStatus.message}
                  </div>
                )}

                {soilResult && (
                  <div className={`soil-result-card soil-tone-${getSoilBandTone(soilResult.fertility_band)}`}>
                    <div className="soil-result-top">
                      <div>
                        <p className="result-label">Soil Insight Report</p>
                        <h4>{soilResult.crop}</h4>
                      </div>
                      <span className="soil-score-pill">{soilResult.fertility_score}/100</span>
                    </div>

                    <div className="soil-kpi-row">
                      <p>
                        <strong>Fertility Band:</strong> {soilResult.fertility_band}
                      </p>
                      <p>
                        <strong>Water Risk:</strong> {soilResult.water_risk}
                      </p>
                      <p>
                        <strong>Nutrient Risk:</strong> {soilResult.nutrient_risk}
                      </p>
                    </div>

                    <p className="soil-yield-note">
                      <strong>Yield Outlook:</strong> {soilResult.yield_outlook}
                    </p>

                    <div className="soil-columns">
                      <div>
                        <p className="soil-block-title">Major Insights</p>
                        <ul className="soil-list">
                          {soilResult.major_insights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="soil-block-title">Key Recommendations</p>
                        <ul className="soil-list">
                          {soilResult.recommendations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <div className="section-heading">
              <p className="section-label">About</p>
              <h2 className="section-title">A student project with a field-first interface</h2>
            </div>
            <div className="about-grid">
              <article className="about-card about-card-primary">
                <h3>Why this concept matters</h3>
                <p className="about-copy">
                  Many crop decisions happen quickly and directly in the field. Leaflens is designed to keep important
                  information visible, readable, and actionable on a phone-sized screen.
                </p>
              </article>
              <article className="about-card">
                <h3>What the current demo includes</h3>
                <ul className="about-list">
                  <li>Component-based React UI with state-driven result rendering.</li>
                  <li>Clearer hierarchy between hero content, feature cards, and interactive tools.</li>
                  <li>Responsive panels that stay usable on desktop and mobile layouts.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-shell">
          <p className="footer-brand">Leaflens Demo</p>
          <p>Educational frontend prototype for crop health workflows • March 2026</p>
        </div>
      </footer>
    </>
  );
}

export default App;
