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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [crop, setCrop] = useState("Rice");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("No image selected yet.");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [location, setLocation] = useState("");
  const [weatherCards, setWeatherCards] = useState([]);
  const [weatherMetaInfo, setWeatherMetaInfo] = useState("Live forecast powered by Open-Meteo.");
  const [weatherStatus, setWeatherStatus] = useState(null);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [demoUploadStep, setDemoUploadStep] = useState(1);

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

    const possible = diseases.filter((disease) => disease.crop.includes(crop));
    const randomPool = possible.length ? possible : diseases;
    const diseaseForCrop = randomPool[0];
    const imageSource = previewUrl || diseaseImgs[Math.floor(Math.random() * diseaseImgs.length)];

    let shouldDetectDisease = true;
    let resultPayload;

    if (isInterviewMode) {
      const fileName = selectedFile?.name.toLowerCase() || "";
      const firstImagePattern = /(first|image[\s_-]*1|img[\s_-]*1|sample[\s_-]*1)/;
      const secondImagePattern = /(second|image[\s_-]*2|img[\s_-]*2|sample[\s_-]*2)/;

      if (firstImagePattern.test(fileName)) {
        shouldDetectDisease = false;
      } else if (secondImagePattern.test(fileName)) {
        shouldDetectDisease = true;
      } else {
        shouldDetectDisease = demoUploadStep >= 2;
      }

      setDemoUploadStep((prev) => prev + 1);

      resultPayload = shouldDetectDisease
        ? {
            ...diseaseForCrop,
            statusLabel: "Disease detected"
          }
        : {
            name: "No disease detected",
            desc: "Leaf appears healthy in this demo pass. No visible disease signature was identified.",
            severity: "None",
            advice: "Continue regular monitoring, balanced irrigation, and preventive care.",
            crop: [crop],
            statusLabel: "Disease not detected"
          };
    } else {
      const randDisease = randomPool[Math.floor(Math.random() * randomPool.length)];
      resultPayload = {
        ...randDisease,
        statusLabel: "Disease detected"
      };
    }

    setDiseaseResult({
      ...resultPayload,
      crop,
      imageSource,
      isDetected: shouldDetectDisease,
      imageAlt: selectedFile ? `${crop} leaf uploaded for analysis` : `${resultPayload.name} sample image`
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
              </div>
            </div>
            <aside className="hero-panel">
              <div className="hero-panel-card">
                <p className="panel-label">Field Snapshot</p>
                <h2>One screen for the two checks farmers make most often.</h2>
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
                      <h3>Field-ready layout</h3>
                      <p>Large touch targets and short summaries keep the interface usable on phones.</p>
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
              <h2 className="section-title">Built around the two screens growers reach for first</h2>
              <p className="section-copy">
                This version is still a frontend demo, but the interface now feels closer to a real product with
                clearer hierarchy, stronger form panels, and easier-to-scan outputs.
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
                      <option>Rice</option>
                      <option>Wheat</option>
                      <option>Tomato</option>
                      <option>Potato</option>
                      <option>Maize</option>
                      <option>Sugarcane</option>
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
                      Demo mode only. If you skip upload, Leaflens will use a sample disease image.
                    </p>
                    <p className="upload-status">{uploadStatus}</p>
                  </div>
                  <div className="form-group">
                    <button type="submit">Analyze Image</button>
                  </div>
                </form>

                {diseaseResult && (
                  <div className="result-card" data-severity={diseaseResult.severity.toLowerCase()} style={{ display: "block" }}>
                    <div className="result-header">
                      <div>
                        <p className="result-label">Detection Result</p>
                        <h3 id="disease-title">{diseaseResult.name}</h3>
                      </div>
                      <span className="result-pill">Demo Output</span>
                    </div>
                    <p className="result-summary">
                      <strong>Crop analyzed:</strong> {diseaseResult.crop} • <strong>Mode:</strong>{" "}
                      {selectedFile ? "Uploaded image preview" : "Sample image demo"} • <strong>Status:</strong>{" "}
                      {diseaseResult.statusLabel}
                    </p>
                    <div className="result-body">
                      <div className="result-details">
                        <p>{diseaseResult.desc}</p>
                        <p>
                          <strong>Severity:</strong> {diseaseResult.severity}
                        </p>
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
