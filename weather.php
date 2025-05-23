<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$apiKey = 'd0297d463117d7a11c5bb09cfb925a76';

// Update these with your actual database credentials
$host = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USERNAME') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
$database = getenv('DB_NAME') ?: 'weather';
$port = 3306;

$conn = mysqli_connect($host, $username, $password, $database, $port);

if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Create database if not exists
$createDatabase = "CREATE DATABASE IF NOT EXISTS $database";
$query = mysqli_query($conn, $createDatabase);

if (!$query) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create database: ' . mysqli_error($conn)]);
    exit;
}

// Select the database after creation
mysqli_select_db($conn, $database);

// Create table for weather data
$createTable = "CREATE TABLE IF NOT EXISTS weather_data(
    city VARCHAR(255),
    temperature FLOAT,
    description VARCHAR(255),
    icon VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)";
$table_query = mysqli_query($conn, $createTable);

if (!$table_query) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create table: ' . mysqli_error($conn)]);
    exit;
}

if (isset($_GET['city'])) {
    $city = $_GET['city'];
} else {
    $city = 'London';
}

// Sanitize and prepare statements
$city = trim($city);

if (isset($_GET['action']) && $_GET['action'] === 'history') {
    // Prepare statement for history query
    $stmt = $conn->prepare("SELECT temperature, description, icon, created_at FROM weather_data WHERE city = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();

    $historyData = [];
    while ($row = $result->fetch_assoc()) {
        $historyData[] = $row;
    }
    $stmt->close();

    // Return data in ascending order by created_at
    $historyData = array_reverse($historyData);

    echo json_encode($historyData);
    exit;
} else {
    // Prepare statement for cache check
    $stmt = $conn->prepare("SELECT temperature, description, icon, created_at FROM weather_data WHERE city = ? AND created_at >= NOW() - INTERVAL 1 HOUR ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Database query failed: ' . $conn->error]);
        exit;
    }

    if ($result->num_rows == 0) {
        // Fetch weather data from OpenWeatherMap API
        $apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" . urlencode($city) . "&appid=" . $apiKey . "&units=metric";
        $response = @file_get_contents($apiUrl);

        if ($response === FALSE) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch data from OpenWeatherMap API']);
            exit;
        }

        $data = json_decode($response, true);

        if ($data && $data['cod'] == 200) {
            $temperature = $data['main']['temp'];
            $description = $data['weather'][0]['description'];
            $icon = $data['weather'][0]['icon'];

            // Insert data into database using prepared statement
            $insert_stmt = $conn->prepare("INSERT INTO weather_data (city, temperature, description, icon) VALUES (?, ?, ?, ?)");
            $insert_stmt->bind_param("sdss", $city, $temperature, $description, $icon);
            $insert_stmt->execute();
            $insert_stmt->close();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'City not found or API error']);
            exit;
        }
    } else {
        // Use cached data from database
        $row = $result->fetch_assoc();
        $temperature = $row['temperature'];
        $description = $row['description'];
        $icon = $row['icon'];
    }
    $stmt->close();

    $response_data = [
        'city' => $city,
        'temperature' => $temperature,
        'description' => $description,
        'icon' => $icon
    ];

    echo json_encode($response_data);
}
?>
