CREATE DATABASE IF NOT EXISTS weather;
USE weather;

CREATE TABLE IF NOT EXISTS weather_data (
    city VARCHAR(255),
    temperature FLOAT,
    description VARCHAR(255),
    icon VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
