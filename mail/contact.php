<?php
/**
 * Respaldo opcional del formulario de contacto.
 *
 * Solo se usa cuando VITE_CONTACT_FALLBACK_URL apunta aquí y la Cloud
 * Function no está disponible. Firebase Hosting no ejecuta PHP: este archivo
 * requiere un servidor con PHP y un transporte de correo configurado.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
  exit;
}

$raw = file_get_contents('php://input');
$data = $_POST;

if ($raw !== false && $raw !== '') {
  $json = json_decode($raw, true);
  if (is_array($json)) {
    $data = array_merge($data, $json);
  }
}

$clean = static function ($value, $max = 2000) {
  $value = is_string($value) ? $value : '';
  $value = str_replace(["\r", "\n"], ' ', trim($value));
  $value = strip_tags($value);
  return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
};

$length = static function ($value) {
  return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
};

$name = $clean($data['name'] ?? '', 120);
$email = $clean($data['email'] ?? '', 180);
$subject = $clean($data['subject'] ?? '', 160);
$message = is_string($data['message'] ?? null) ? $data['message'] : '';
$message = trim($message);
$message = strip_tags($message);
$message = function_exists('mb_substr') ? mb_substr($message, 0, 3000) : substr($message, 0, 3000);
$honeypot = $clean($data['honeypot'] ?? '', 120);

if ($honeypot !== '') {
  echo json_encode(['ok' => true]);
  exit;
}

if (
  $length($name) < 2 ||
  $length($message) < 10 ||
  !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Datos incompletos']);
  exit;
}

$to = getenv('CONTACT_TO');
if (!$to) {
  $to = 'manuelabermudezrealestate@gmail.com';
}

$mailSubject = $subject !== ''
  ? "Contacto web: $subject"
  : 'Nuevo mensaje desde el sitio web';

$body = "Nuevo mensaje desde el sitio web\n\n"
  . "Nombre: $name\n"
  . "Correo: $email\n"
  . "Asunto: " . ($subject !== '' ? $subject : 'Sin asunto') . "\n\n"
  . $message;

$headers = [
  'From: no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'),
  "Reply-To: $email",
  'Content-Type: text/plain; charset=UTF-8',
];

if (!mail($to, $mailSubject, $body, implode("\r\n", $headers))) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'No se pudo enviar el correo']);
  exit;
}

echo json_encode(['ok' => true]);
