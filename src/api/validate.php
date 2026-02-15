<?php

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\NumberParseException;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input) || !isset($input['phone']) || !is_string($input['phone'])) {
    http_response_code(400);
    echo json_encode([
        'valid' => false,
        'error' => 'Phone number is required',
    ]);
    exit;
}

$phoneNumber = trim($input['phone']);

if ($phoneNumber === '') {
    http_response_code(400);
    echo json_encode([
        'valid' => false,
        'error' => 'Phone number is required',
    ]);
    exit;
}

$phoneUtil = PhoneNumberUtil::getInstance();

try {
    $parsed = $phoneUtil->parse($phoneNumber, null);

    $isValid = $phoneUtil->isValidNumber($parsed);
    $regionCode = $phoneUtil->getRegionCodeForNumber($parsed);

    $response = [
        'valid' => $isValid,
        'country' => $regionCode,
        'country_code' => $parsed->getCountryCode(),
        'national_number' => $phoneUtil->format($parsed, PhoneNumberFormat::NATIONAL),
    ];

    if (!$isValid) {
        $response['error'] = 'The phone number is not valid for the detected region.';
    }

    echo json_encode($response);

} catch (NumberParseException $e) {
    http_response_code(400);

    $userMessage = match ($e->getErrorType()) {
        NumberParseException::INVALID_COUNTRY_CODE => 'Invalid country code. Please include the international prefix (e.g. +372).',
        NumberParseException::NOT_A_NUMBER => 'The input is not a valid number.',
        NumberParseException::TOO_SHORT_AFTER_IDD => 'The phone number is too short after the country code.',
        NumberParseException::TOO_SHORT_NSN => 'The phone number is too short.',
        NumberParseException::TOO_LONG => 'The phone number is too long.',
        default => 'Could not parse the phone number. Please check the format.',
    };

    echo json_encode([
        'valid' => false,
        'error' => $userMessage,
    ]);
}
