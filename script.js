import { getWeather } from './store_new.js';

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
        document.getElementById('weatherResult').innerHTML = 
            `<div>
                <h3>${weather.city}</h3>
                <img src="${weather.icon}" alt="Weather icon" />
                <p>${weather.description}</p>
                <p>Temperature: ${weather.temperature}°C</p>
            </div>`;
    } catch (err) {
        alert('Could not get weather data.');
        console.error(err);
    }
});

window.addEventListener('load', () => {
    // Optionally load default city weather on page load
    const defaultCity = 'Delhi';
    getWeather(defaultCity).then(weather => {
        document.getElementById('weatherResult').innerHTML = 
            `<div>
                <h3>${weather.city}</h3>
                <img src="${weather.icon}" alt="Weather icon" />
                <p>${weather.description}</p>
                <p>Temperature: ${weather.temperature}°C</p>
            </div>`;
        document.getElementById('cityName').value = defaultCity;
    }).catch(err => {
        console.error(err);
    });
});
