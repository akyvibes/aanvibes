const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { city } = event.queryStringParameters;
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                city: data.name,
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
