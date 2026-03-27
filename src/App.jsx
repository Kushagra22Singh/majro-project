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
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const isGitHubPagesHost =
  typeof window !== "undefined" && /github\.io$/i.test(window.location.hostname);

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

  let fertilityScore = 100;
  if (ph < 6 || ph > 7.8) fertilityScore -= 10;
  if (levels.nitrogen !== "optimal") fertilityScore -= 8;
  if (levels.phosphorus !== "optimal") fertilityScore -= 8;
  if (levels.potassium !== "optimal") fertilityScore -= 8;
  if (levels.organicCarbon === "low") fertilityScore -= 10;
  if (moisture < 30 || moisture > 75) fertilityScore -= 8;
  if (temperature > 35 || temperature < 12) fertilityScore -= 5;
  if (rainfall > 180) fertilityScore -= 4;

  fertilityScore = Math.max(20, Math.min(98, Number(fertilityScore.toFixed(1))));

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
    recommendations
  };
}

function App() {
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

  const handleDiseaseSubmit = (event) => {
    event.preventDefault();
    setDetectionStatus({ type: "loading", message: "Analyzing image with ML model..." });

    if (!selectedFile) {
      setDetectionStatus({ type: "error", message: "Please upload an image first." });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("crop", crop);

    fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((payload) => {
            throw new Error(payload.error || "API request failed. Is the backend running on port 5000?");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
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
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setDetectionStatus({ type: "error", message: errorMessage });
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
            Leaflens
          </a>
          <ul className={`nav-links${menuOpen ? " active" : ""}`}>
            <li>
              <a href="#home" onClick={() => setMenuOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="#services" onClick={() => setMenuOpen(false)}>
                Services
              </a>
            </li>
            <li>
              <a href="#soil-tool" onClick={() => setMenuOpen(false)}>
                Soil
              </a>
            </li>
            <li>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>
            </li>
          </ul>
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
              <p className="hero-kicker">Precision farming demo for Indian growers</p>
              <h1>Spot crop disease faster and plan field work with more confidence.</h1>
              <p className="hero-text">
                Leaflens brings crop symptom screening and simple weather guidance into one clear mobile-friendly
                interface so farmers can review what they see in the field and decide what to do next.
              </p>
              <div className="hero-actions">
                <a href="#services" className="cta-button">
                  Try Demo
                </a>
                <a href="#about" className="secondary-button">
                  See Project Scope
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
                      <h3>Leaf scan demo</h3>
                      <p>Select a crop, upload a leaf image, and review a structured disease summary.</p>
                    </div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-value">02</span>
                    <div>
                      <h3>Weather outlook</h3>
                      <p>Generate a quick three-day forecast card with rainfall and work advice.</p>
                    </div>
                  </div>
                  <div className="snapshot-item">
                    <span className="snapshot-value">03</span>
                    <div>
                      <h3>Soil intelligence</h3>
                      <p>Input soil values and get major fertility, water, and nutrient risk insights instantly.</p>
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
              <p className="section-label">Platform</p>
              <h2 className="section-title">Built around the three checks growers reach for first</h2>
              <p className="section-copy">
                This version is still a frontend demo, but the interface now feels closer to a real product with
                disease, weather, and soil workflows designed for fast field decisions.
              </p>
            </div>

            <div className="services-grid">
              <article className="service-card">
                <div className="service-icon">🌿</div>
                <p className="service-tag">Disease Detection</p>
                <h3>Leaf symptom screening</h3>
                <p>
                  Guide the user from crop selection to image upload with a focused result card and practical treatment
                  advice.
                </p>
              </article>
              <article className="service-card">
                <div className="service-icon">☁️</div>
                <p className="service-tag">Weather Planning</p>
                <h3>Field-ready forecast panel</h3>
                <p>Summarize temperature, rainfall probability, and a short recommendation for the next three days.</p>
              </article>
              <article className="service-card">
                <div className="service-icon">🧪</div>
                <p className="service-tag">Soil Analysis</p>
                <h3>Data-driven soil insights</h3>
                <p>
                  Analyze pH, NPK, moisture, organic carbon, and climate values to get fertility score and major
                  corrective actions.
                </p>
              </article>
            </div>

            <div className="demo-grid">
              <section className="tool-panel" aria-labelledby="detection-heading">
                <div className="panel-heading">
                  <p className="panel-label">Demo 01</p>
                  <h3 className="demo-title" id="detection-heading">
                    Detect Crop Disease
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
                </div>

                <form className="detection-form" onSubmit={handleDiseaseSubmit}>
                  <div className="form-group">
                    <label htmlFor="crop-type">Select Crop</label>
                    <select id="crop-type" value={crop} onChange={(event) => setCrop(event.target.value)}>
                      {supportedModelCrops.map((cropName) => (
                        <option key={cropName}>{cropName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="image-upload">Upload Leaf Photo</label>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setSelectedFile(file);
                        setUploadStatus(file ? `Selected image: ${file.name}` : "No image selected yet.");
                      }}
                    />
                    <p className="form-hint">
                      Crop list is limited to what your current ML model supports.
                    </p>
                    <p className="upload-status">{uploadStatus}</p>
                  </div>
                  <div className="form-group">
                    <button type="submit">Analyze Image</button>
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
