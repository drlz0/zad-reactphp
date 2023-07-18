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

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read the request body
    $requestData = json_decode(file_get_contents('php://input'), true);

    // Extract the action, channel, and amount from the request data
    $action = $requestData['action'];
    $channel = $requestData['channel'];
    $amount = $requestData['amount'];

    

    // Perform the corresponding database operation based on the action
    switch ($action) {
        case 'CREATE':
            // Check if the channel already exists in the database
            $checkQuery = "SELECT channel FROM channels WHERE channel = ?";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bind_param('s', $channel);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
        
            if ($checkResult->num_rows > 0) {
                $result = ['success' => false, 'message' => 'Channel already exists'];
            } else {
                // Perform the create operation and return the result
                $query = "INSERT INTO channels (channel, amount) VALUES (?, ?)";
                $stmt = $conn->prepare($query);
                $stmt->bind_param('si', $channel, $amount);
                if ($stmt->execute()) {
                    $result = ['success' => true, 'message' => 'Channel created successfully'];
                } else {
                    $result = ['success' => false, 'message' => 'Failed to create channel'];
                }
            }
            break;
        
            case 'UPDATE':
                // Check if the channel exists before performing the update
                $checkQuery = "SELECT COUNT(*) as count FROM channels WHERE channel = ?";
                $checkStmt = $conn->prepare($checkQuery);
                $checkStmt->bind_param('s', $channel);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                $row = $checkResult->fetch_assoc();
                $channelExists = $row['count'] > 0;
            
                if ($channelExists) {
                    // Perform the update operation
                    $updateQuery = "UPDATE channels SET amount = ? WHERE channel = ?";
                    $updateStmt = $conn->prepare($updateQuery);
                    $updateStmt->bind_param('is', $amount, $channel);
                    if ($updateStmt->execute()) {
                        $result = ['success' => true, 'message' => 'Channel updated successfully'];
                    } else {
                        $result = ['success' => false, 'message' => 'Failed to update channel'];
                    }
                } else {
                    $result = ['success' => false, 'message' => 'Channel does not exist'];
                }
                break;
            
            case 'DELETE':
                // Check if the channel exists before performing the delete
                $checkQuery = "SELECT COUNT(*) as count FROM channels WHERE channel = ?";
                $checkStmt = $conn->prepare($checkQuery);
                $checkStmt->bind_param('s', $channel);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                $row = $checkResult->fetch_assoc();
                $channelExists = $row['count'] > 0;
            
                if ($channelExists) {
                    // Perform the delete operation
                    $deleteQuery = "DELETE FROM channels WHERE channel = ?";
                    $deleteStmt = $conn->prepare($deleteQuery);
                    $deleteStmt->bind_param('s', $channel);
                    if ($deleteStmt->execute()) {
                        $result = ['success' => true, 'message' => 'Channel deleted successfully'];
                    } else {
                        $result = ['success' => false, 'message' => 'Failed to delete channel'];
                    }
                } else {
                    $result = ['success' => false, 'message' => 'Channel does not exist'];
                }
                break;            

        default:
            $result = ['success' => false, 'message' => 'Invalid action'];
            break;
        }

    // Set the response headers
    header('Content-Type: application/json');

    // Output the result as JSON
    echo json_encode($result);
} else {
    // Invalid request method
    // You can handle this case accordingly
    // For example, return an error message or redirect to an error page
    echo 'Invalid request method';
}