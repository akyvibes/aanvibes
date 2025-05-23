import { getWeather } from './store.js';

// Simple weather app example using localStorage caching

document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const city = document.getElementById('cityName').value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const weather = await getWeather(city);
        // Display weather data (simple example)
        document.getElementById('weatherResult').textContent = 
            `Weather in ${city}: ${weather.description}, Temp: ${weather.temperature}°C`;
    } catch (err) {
        alert('Could not get weather data.');
        console.error(err);
    }
});

window.addEventListener('load', () => {
    // Optionally load default city weather on page load
    const defaultCity = 'Delhi';
    getWeather(defaultCity).then(weather => {
        document.getElementById('weatherResult').textContent = 
            `Weather in ${defaultCity}: ${weather.description}, Temp: ${weather.temperature}°C`;
        document.getElementById('cityName').value = defaultCity;
    }).catch(err => {
        console.error(err);
    });
});
