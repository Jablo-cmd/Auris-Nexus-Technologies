<?php
declare(strict_types=1);

/**
 * Same-origin contact-form endpoint for Auris Nexus Technologies.
 * No submissions are written to disk or a database.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['status' => $status < 400 ? 'OK' : 'ERROR', 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function requestValue(string $key, int $maximumLength): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        respond(422, 'Please check the information you entered and try again.');
    }

    $value = trim(str_replace("\0", '', $value));
    if (!preg_match('//u', $value) || strlen($value) > $maximumLength) {
        respond(422, 'Please check the information you entered and try again.');
    }

    return $value;
}

function cleanForMessage(string $value): string
{
    return str_replace(["\r\n", "\r"], "\n", $value);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, 'This endpoint accepts form submissions only.');
}

// Keep this endpoint small and predictable. The individual field limits below
// are stricter still; this protects against oversized multipart request bodies.
$contentLength = filter_input(INPUT_SERVER, 'CONTENT_LENGTH', FILTER_VALIDATE_INT);
if ($contentLength !== false && $contentLength !== null && $contentLength > 16384) {
    respond(413, 'Your submission is too large. Please shorten your message and try again.');
}

// Browser submissions must originate from this site. The server remains the
// authority for all validation; this simply rejects cross-site browser posts.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://aurisnexus.co.za', 'https://www.aurisnexus.co.za'];
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    respond(403, 'Unable to process this submission. Please try again.');
}

// Honeypot: bots commonly populate every field. Reply generically so the
// endpoint does not reveal that the submission was discarded.
if (requestValue('website', 200) !== '') {
    respond(200, 'Thank you. Your enquiry has been received. The Auris Nexus Technologies team will get back to you shortly.');
}

$name = requestValue('name', 120);
$email = requestValue('email', 254);
$company = requestValue('company', 160);
$phone = requestValue('phone', 60);
$industry = requestValue('industry', 120);
$service = requestValue('service', 120);
$budget = requestValue('budget', 80);
$timeline = requestValue('timeline', 80);
$message = requestValue('message', 5000);

if (strlen($name) < 2 || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, 'Please provide your name, a valid email address, and a project description.');
}

// No user-controlled value is used in a mail header except the validated
// address below. Explicitly reject CR/LF characters to prevent header injection.
if (preg_match('/[\r\n]/', $email)) {
    respond(422, 'Please provide a valid email address.');
}

$submittedAt = new DateTimeImmutable('now', new DateTimeZone('Africa/Johannesburg'));
$details = [
    'Name' => $name,
    'Email' => $email,
    'Phone' => $phone,
    'Company' => $company,
    'Industry' => $industry,
    'Service' => $service,
    'Budget' => $budget,
    'Timeline' => $timeline,
];

$body = "A new enquiry was submitted through the Auris Nexus Technologies website.\n\n";
foreach ($details as $label => $value) {
    $body .= $label . ': ' . ($value !== '' ? cleanForMessage($value) : 'Not provided') . "\n";
}
$body .= "\nProject description:\n" . cleanForMessage($message) . "\n\n";
$body .= 'Submitted: ' . $submittedAt->format('Y-m-d H:i:s T') . "\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Auris Nexus Website <info@aurisnexus.co.za>',
    'Reply-To: ' . $email,
];

// The recipient is fixed and intentionally not configurable by the client.
$sent = @mail(
    'info@aurisnexus.co.za',
    'Auris Nexus Website Enquiry',
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    respond(500, 'We could not send your enquiry right now. Please try again or email us directly.');
}

respond(200, 'Thank you. Your enquiry has been received. The Auris Nexus Technologies team will get back to you shortly.');
