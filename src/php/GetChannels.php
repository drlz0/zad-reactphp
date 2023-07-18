<?php

// Allow requests from any origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, access-control-allow-headers');

require_once 'DatabaseConnector.php';

use php\DatabaseConnector;

// Create an instance of DatabaseConnector
$dbConnector = new DatabaseConnector();

// Get the database connection
$conn = $dbConnector->getConnection();

// Fetch the channel data from the database
$query = "SELECT * FROM channels";
$result = $conn->query($query);

if ($result) {
    $channels = array();
    while ($row = $result->fetch_assoc()) {
        $channels[] = $row;
    }

    // Set the response headers
    header('Content-Type: application/json');

    // Output the channel data as JSON
    echo json_encode($channels);
} else {
    // Handle the case when fetching the channel data fails
    $response = ['success' => false, 'message' => 'Failed to fetch channel data'];
    
    // Set the response headers
    header('Content-Type: application/json');
    
    // Output the error response as JSON
    echo json_encode($response);
}
