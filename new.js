async function getWeather(city) {
    const cacheKey = 'weather_' + city.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const cachedObj = JSON.parse(cached);
        if (now - cachedObj.time < 60 * 60 * 1000) { // 1 hour cache
            console.log('Using cached weather data for', city);
            updateWeatherUI(cachedObj.data);
            return;
        }
    }

    const url = `weather.php?city=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (data.temperature !== null) {
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
    document.getElementById('cityName').innerText = data.city;
    document.getElementById('temperature').innerText = `${data.temperature} °C`;
    document.getElementById('description').innerText = data.description;
    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
    document.getElementById('weatherIcon').alt = data.description;
    document.getElementById('weatherInfo').style.display = 'block';
}

let temperatureChart = null;

async function getWeatherHistory(city) {
    const url = `weather.php?action=history&city=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('History data:', data);

        if (data.length > 0) {
            const labels = data.map(entry => new Date(entry.created_at).toLocaleTimeString());
            const temps = data.map(entry => entry.temperature);

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
                            suggestedMin: Math.min(...temps) - 5,
                            suggestedMax: Math.max(...temps) + 5
                        }
                    }
                }
            });
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

document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        getWeather(city);
        getWeatherHistory(city);
        getWeatherNews(city);
    } else {
        alert('Please select a city.');
    }
});

// Load default weather, history, and news for Kathmandu on page load
window.addEventListener('load', () => {
    getWeather('Kathmandu');
    getWeatherHistory('Kathmandu');
    getWeatherNews('Kathmandu');
});

// Function to fetch weather news using NewsAPI.org (replace YOUR_API_KEY with a valid key)
async function getWeatherNews(city) {
    const apiKey = 'YOUR_API_KEY'; // You need to get your own API key from https://newsapi.org/
    const url = `https://newsapi.org/v2/everything?q=weather+${encodeURIComponent(city)}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const newsList = document.getElementById('newsList');
        newsList.innerHTML = '';

        if (data.status === 'ok' && data.articles.length > 0) {
            data.articles.slice(0, 5).forEach(article => {
                const li = document.createElement('li');
                li.style.marginBottom = '10px';

                const a = document.createElement('a');
                a.href = article.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.style.color = '#fff';
                a.style.textDecoration = 'none';
                a.textContent = article.title;

                li.appendChild(a);
                newsList.appendChild(li);
            });
        } else {
            newsList.innerHTML = '<li>No recent weather news found.</li>';
        }
    } catch (error) {
        console.error('Error fetching weather news:', error);
        const newsList = document.getElementById('newsList');
        newsList.innerHTML = '<li>Failed to load weather news.</li>';
    }
}
