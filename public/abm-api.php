<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Cache-Control: no-store');

$action = $_GET['action'] ?? '';
$userId = $_GET['user_id'] ?? '';
$allowedActions = [
    'items' => ['method' => 'GET', 'endpoint' => 'items'],
    'save-orders' => ['method' => 'POST', 'endpoint' => 'save-orders'],
];

if (!isset($allowedActions[$action]) || !ctype_digit((string) $userId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid pre-arrival request.']);
    exit;
}

$route = $allowedActions[$action];
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($requestMethod !== $route['method']) {
    http_response_code(405);
    header('Allow: ' . $route['method']);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$remoteUrl = sprintf(
    'https://abm.spurspaces.com/remote/abm/pre-arrivals/users/%s/%s',
    rawurlencode((string) $userId),
    $route['endpoint']
);

$curl = curl_init($remoteUrl);
$headers = [
    'Accept: application/json',
    'Authorization: Bearer abm_12345_secure_token',
];

curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => $headers,
]);

if ($requestMethod === 'POST') {
    $requestBody = file_get_contents('php://input') ?: '{}';
    $headers[] = 'Content-Type: application/json';
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $requestBody);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
}

$responseBody = curl_exec($curl);
$responseStatus = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($responseBody === false) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to connect to the pre-arrival service.',
        'error' => $curlError,
    ]);
    exit;
}

http_response_code($responseStatus > 0 ? $responseStatus : 502);
echo $responseBody;

