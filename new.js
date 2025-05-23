import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');

const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const weatherInfoDiv = document.getElementById('weatherInfo');

const ctx = document.getElementById('temperatureChart').getContext('2d');
let temperatureChart = null;

getWeatherBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) return;

  fetchCurrentWeather(city);
  fetchWeatherHistory(city);
});

// Fetch current weather (not cached here)
async function fetchCurrentWeather(city) {
  try {
    const response = await fetch(weather.php?city=${encodeURIComponent(city)});
    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    // Update weather info UI
    cityNameEl.textContent = data.city;
    temperatureEl.textContent = ${data.temperature.toFixed(1)} °C;
    descriptionEl.textContent = data.description;
    weatherIconEl.src = https://openweathermap.org/img/wn/${data.icon}@2x.png;
    weatherIconEl.alt = data.description;

    weatherInfoDiv.style.display = 'block';

  } catch (err) {
    console.error('Error fetching current weather:', err);
  }
}

// Fetch historical weather (cached in localStorage)
async function fetchWeatherHistory(city) {
  const cacheKey = weather_history_${city.toLowerCase()};
  const now = Date.now();

  // Check localStorage cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const cachedObj = JSON.parse(cached);
      if (now - cachedObj.time < 60 * 60 * 1000) { // 1 hour cache
        console.log('Using cached history data');
        renderChart(cachedObj.data);
        return;
      }
    } catch {
      // Ignore parse errors, fetch fresh data
    }
  }

  // Fetch history data from backend
  try {
    const response = await fetch(weather.php?action=history&city=${encodeURIComponent(city)});
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // Cache the data with timestamp
      localStorage.setItem(cacheKey, JSON.stringify({ data: data, time: now }));
      renderChart(data);
    } else {
      clearChart();
    }
  } catch (err) {
    console.error('Error fetching weather history:', err);
    clearChart();
  }
}

function renderChart(data) {
  if (!Array.isArray(data) || data.length === 0) {
    clearChart();
    return;
  }

  const labels = data.map(entry => new Date(entry.created_at).toLocaleTimeString());
  const temps = data.map(entry => entry.temperature);

  if (temperatureChart) {
    temperatureChart.destroy();
  }

  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: 'Time' }
        },
        y: {
          title: { display: true, text: 'Temperature (°C)' },
          suggestedMin: Math.min(...temps) - 5,
          suggestedMax: Math.max(...temps) + 5
        }
      }
    }
  });
}

function clearChart() {
  if (temperatureChart) {
    temperatureChart.destroy();
    temperatureChart = null;
  }
}
