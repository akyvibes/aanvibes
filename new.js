async function getWeather(city) {
    const cacheKey = 'weather_' + city.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const cachedObj = JSON.parse(cached);
        if (now - cachedObj.time < 60 * 60 * 1000) {
            console.log('Using cached weather data for', city);
            updateWeatherUI(cachedObj.data);
            return;
        }
    }

    const url = 'weather.php?city=' + encodeURIComponent(city);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);

        if (data.temperature !== undefined && data.temperature !== null) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: data, time: now }));
            updateWeatherUI(data);
        } else {
            document.getElementById('weatherInfo').style.display = 'none';
            alert('Weather data not found for the specified city.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data.');
    }
}

function updateWeatherUI(data) {
    document.getElementById('cityName').innerText = data.city || '';
    document.getElementById('temperature').innerText = data.temperature !== undefined ? data.temperature + ' °C' : '';
    document.getElementById('description').innerText = data.description || '';
    if (data.icon) {
        document.getElementById('weatherIcon').src = 'http://openweathermap.org/img/wn/' + data.icon + '@2x.png';
        document.getElementById('weatherIcon').alt = data.description || '';
        document.getElementById('weatherIcon').style.display = 'inline';
    } else {
        document.getElementById('weatherIcon').style.display = 'none';
    }
    document.getElementById('weatherInfo').style.display = 'block';
}

let temperatureChart = null;

async function getWeatherHistory(city) {
    const cacheKey = 'weather_history_' + city.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const cachedObj = JSON.parse(cached);
        if (now - cachedObj.time < 60 * 60 * 1000) {
            console.log('Using cached weather history for', city);
            renderChart(cachedObj.data);
            return;
        }
    }

    const url = 'weather.php?action=history&city=' + encodeURIComponent(city);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('History data:', data);

        if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: data, time: now }));
            renderChart(data);
        } else {
            if (temperatureChart) {
                temperatureChart.destroy();
                temperatureChart = null;
            }
        }
    } catch (error) {
        console.error('Error fetching weather history:', error);
    }
}

function renderChart(data) {
    const labels = data.map(function(entry) { return new Date(entry.created_at).toLocaleTimeString(); });
    const temps = data.map(function(entry) { return entry.temperature; });

    const ctx = document.getElementById('temperatureChart').getContext('2d');

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
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    suggestedMin: Math.min.apply(null, temps) - 5,
                    suggestedMax: Math.max.apply(null, temps) + 5
                }
            }
        }
    });
}

document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        getWeather(city);
        getWeatherHistory(city);
    } else {
        alert('Please select a city.');
    }
});

window.addEventListener('load', function() {
    getWeather('Kathmandu');
    getWeatherHistory('Kathmandu');
});
