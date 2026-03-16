const diseases = [
    { name: "Brown Spot", desc: "Circular brown spots with gray center on leaves.", severity: "Moderate", advice: "Use fungicide like Tricyclazole. Remove affected leaves.", crop: ["Rice"] },
    { name: "Blast", desc: "Diamond-shaped lesions with gray-white center.", severity: "High", advice: "Apply Carbendazim early. Avoid excess nitrogen.", crop: ["Rice"] },
    { name: "Leaf Rust", desc: "Orange-brown pustules on leaves.", severity: "Medium", advice: "Use Propiconazole. Plant resistant varieties.", crop: ["Wheat"] },
    { name: "Early Blight", desc: "Dark concentric rings on leaves.", severity: "Moderate", advice: "Spray Mancozeb. Improve air circulation.", crop: ["Tomato", "Potato"] },
    { name: "Late Blight", desc: "Dark green-black patches, white mold.", severity: "High", advice: "Use Metalaxyl + Mancozeb urgently.", crop: ["Potato", "Tomato"] },
    { name: "Turcicum Leaf Blight", desc: "Long grayish-brown streaks.", severity: "Medium", advice: "Spray Azoxystrobin. Crop rotation helps.", crop: ["Maize"] },
    { name: "Red Rot", desc: "Reddening of cane interior, shriveling.", severity: "High", advice: "Use disease-free setts. Rogue infected plants.", crop: ["Sugarcane"] }
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

const geocodeEndpoint = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

const diseaseForm = document.getElementById('diseaseForm');
const weatherForm = document.getElementById('weatherForm');
const diseaseImage = document.getElementById('disease-img');
const uploadInput = document.getElementById('image-upload');
const uploadStatus = document.getElementById('upload-status');
const locationInput = document.getElementById('location');
const weatherGrid = document.getElementById('weather-result');
const weatherMetaInfo = document.getElementById('weather-meta-info');
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

function setDiseasePreview(file, crop, diseaseName) {
    const oldObjectUrl = diseaseImage.dataset.objectUrl;
    if (oldObjectUrl) {
        URL.revokeObjectURL(oldObjectUrl);
        delete diseaseImage.dataset.objectUrl;
    }

    if (file) {
        const objectUrl = URL.createObjectURL(file);
        diseaseImage.src = objectUrl;
        diseaseImage.alt = `${crop} leaf uploaded for analysis`;
        diseaseImage.dataset.objectUrl = objectUrl;
    } else {
        const sampleImage = diseaseImgs[Math.floor(Math.random() * diseaseImgs.length)];
        diseaseImage.src = sampleImage;
        diseaseImage.alt = `${diseaseName} sample image`;
    }

    diseaseImage.style.display = 'block';
}

function getWeatherLabel(code) {
    return weatherCodeLabels[code] || 'Variable weather';
}

function getFarmingAdvice(maxTemp, minTemp, rainChance, weatherCode) {
    if (weatherCode >= 95) {
        return 'Thunderstorm risk expected. Avoid open-field operations during lightning hours.';
    }
    if (rainChance >= 70) {
        return 'High rain chance. Delay spraying and protect inputs and harvested produce.';
    }
    if (rainChance >= 40) {
        return 'Possible showers. Keep drainage channels open and plan flexible fieldwork windows.';
    }
    if (maxTemp >= 36) {
        return 'Hot conditions expected. Prefer irrigation in early morning or late evening.';
    }
    if (minTemp <= 10) {
        return 'Cool night temperatures expected. Protect sensitive seedlings where needed.';
    }
    return 'Stable weather expected. Suitable window for routine field monitoring and light operations.';
}

function formatForecastDate(dateString, timeZone) {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(dateObj);
    const fullDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone }).format(dateObj);

    return { weekday, fullDate };
}

function formatUpdatedTime(timeZone) {
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    try {
        return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(new Date());
    } catch (error) {
        return new Intl.DateTimeFormat('en-GB', options).format(new Date());
    }
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Unable to reach weather service right now. Please try again.');
    }
    return response.json();
}

async function getLocationDetails(locationName) {
    const query = new URLSearchParams({
        name: locationName,
        count: '1',
        language: 'en',
        format: 'json'
    });
    const data = await fetchJson(`${geocodeEndpoint}?${query.toString()}`);

    if (!data.results || data.results.length === 0) {
        throw new Error('Location not found. Try a city name like Delhi, Pune, or Jaipur.');
    }

    const bestMatch = data.results[0];
    const placeParts = [bestMatch.name, bestMatch.admin1, bestMatch.country].filter(Boolean);

    return {
        latitude: bestMatch.latitude,
        longitude: bestMatch.longitude,
        timeZone: bestMatch.timezone || 'Asia/Kolkata',
        displayName: placeParts.join(', ')
    };
}

async function getForecast(latitude, longitude, timeZone) {
    const query = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: timeZone,
        forecast_days: '3'
    });
    const data = await fetchJson(`${forecastEndpoint}?${query.toString()}`);

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        throw new Error('Forecast data is currently unavailable for this location.');
    }

    return data.daily;
}

function showWeatherStatus(message, type) {
    weatherGrid.innerHTML = `<div class="weather-status weather-status-${type}">${message}</div>`;
    weatherGrid.style.display = 'grid';
}

function renderWeatherCards(dailyData, place) {
    weatherGrid.innerHTML = '';

    for (let dayIndex = 0; dayIndex < dailyData.time.length; dayIndex += 1) {
        const maxTemp = Math.round(dailyData.temperature_2m_max[dayIndex]);
        const minTemp = Math.round(dailyData.temperature_2m_min[dayIndex]);
        const rainChance = Math.round(dailyData.precipitation_probability_max[dayIndex] ?? 0);
        const weatherCode = dailyData.weathercode[dayIndex];
        const conditionLabel = getWeatherLabel(weatherCode);
        const advice = getFarmingAdvice(maxTemp, minTemp, rainChance, weatherCode);
        const { weekday, fullDate } = formatForecastDate(dailyData.time[dayIndex], place.timeZone);

        const card = document.createElement('div');
        card.className = 'weather-card';
        card.style.animationDelay = `${dayIndex * 120}ms`;
        card.innerHTML = `
            <p class="weather-day">${weekday}</p>
            <p class="weather-date">${fullDate}</p>
            <div class="temp">${maxTemp}°C</div>
            <p class="weather-condition">${conditionLabel}</p>
            <div class="weather-meta">
                <span>Min ${minTemp}°C</span>
                <span>Rain ${rainChance}%</span>
            </div>
            <p class="weather-advice"><em>${advice}</em></p>
        `;
        weatherGrid.appendChild(card);
    }

    weatherGrid.style.display = 'grid';
}

diseaseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const crop = document.getElementById('crop-type').value;
    const selectedFile = uploadInput.files[0];
    const possible = diseases.filter((disease) => disease.crop.includes(crop));
    const randomPool = possible.length ? possible : diseases;
    const randDisease = randomPool[Math.floor(Math.random() * randomPool.length)];
    const result = document.getElementById('result');

    document.getElementById('disease-title').textContent = randDisease.name;
    document.getElementById('analysis-summary').innerHTML = `<strong>Crop analyzed:</strong> ${crop} • <strong>Mode:</strong> ${selectedFile ? 'Uploaded image preview' : 'Sample image demo'}`;
    document.getElementById('disease-desc').textContent = randDisease.desc;
    document.getElementById('disease-severity').innerHTML = `<strong>Severity:</strong> ${randDisease.severity}`;
    document.getElementById('disease-advice').innerHTML = `<strong>Recommendation:</strong> ${randDisease.advice}`;

    setDiseasePreview(selectedFile, crop, randDisease.name);

    result.dataset.severity = randDisease.severity.toLowerCase();
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });
});

weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const locationName = locationInput.value.trim() || 'Delhi';
    showWeatherStatus(`Fetching live forecast for ${locationName}...`, 'loading');

    try {
        const place = await getLocationDetails(locationName);
        const dailyData = await getForecast(place.latitude, place.longitude, place.timeZone);

        renderWeatherCards(dailyData, place);
        weatherMetaInfo.textContent = `Forecast for ${place.displayName} (${place.timeZone}) • Updated ${formatUpdatedTime(place.timeZone)}`;
        weatherGrid.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch forecast right now.';
        showWeatherStatus(message, 'error');
        weatherMetaInfo.textContent = 'Live forecast powered by Open-Meteo.';
    }
});

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    uploadStatus.textContent = file ? `Selected image: ${file.name}` : 'No image selected yet.';
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
    });
});

window.addEventListener('beforeunload', () => {
    const objectUrl = diseaseImage.dataset.objectUrl;
    if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
    }
});