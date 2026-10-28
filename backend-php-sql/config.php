<?php
/**
 * Konfigurasi Koneksi Database PDO (MySQL / MariaDB)
 * LOMBOK NUSANTARA TRAVEL — PT Lombok Nusantara Wisata
 * File: config.php
 */

declare(strict_types=1);

// Konfigurasi Kredensial Database (Sesuaikan dengan cPanel / Server Anda)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'lombok_nusantara_db');
define('DB_USER', getenv('DB_USER') ?: 'lombok_user');
define('DB_PASS', getenv('DB_PASS') ?: 'rahasia_database_anda');
define('DB_CHARSET', 'utf8mb4');

// Zona Waktu Resmi Operasional Lombok (WITA / UTC+8)
date_default_timezone_set('Asia/Makassar');

/**
 * Membuat instance PDO dengan Prepared Statements & Error Mode Exception
 */
function getDatabaseConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status'  => 'error',
                'message' => 'Gagal terhubung ke server database. Silakan coba beberapa saat lagi.'
            ]);
            exit;
        }
    }

    return $pdo;
}

/**
 * Helper untuk mengirim respons JSON standar
 */
function sendJsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
