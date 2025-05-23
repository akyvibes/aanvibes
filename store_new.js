/**
 * Simple weather data caching using localStorage.
 * Fetches weather data directly from OpenWeatherMap API.
 * Saves weather data for a city and reuses it for 1 hour to avoid extra API calls.
 */

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const CACHE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to get weather data for a city
async function getWeather(city) {
    const key = 'weather_' + city.toLowerCase();
    const cached = localStorage.getItem(key);

    if (cached) {
        const cachedObj = JSON.parse(cached);
        const now = Date.now();

        // Check if cached data is still valid
        if (now - cachedObj.time < CACHE_TIME) {
            // Return cached data
            return cachedObj.data;
        }
    }

    // If no cache or cache expired, fetch new data from OpenWeatherMap
    const url = `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Could not get weather data');
    }
    const data = await response.json();

    // Simplify data to only needed fields
    const weatherData = {
        description: data.weather[0].description,
        temperature: data.main.temp,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        city: data.name
    };

    // Save new data to localStorage with current time
    localStorage.setItem(key, JSON.stringify({
        data: weatherData,
        time: Date.now()
    }));

    return weatherData;
}

// Example usage:
// getWeather('Delhi').then(data => console.log(data)).catch(err => console.error(err));

export { getWeather };
