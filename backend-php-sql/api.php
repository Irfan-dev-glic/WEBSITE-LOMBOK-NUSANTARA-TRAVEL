<?php
/**
 * REST API Endpoint untuk Reservasi Paket Wisata, Transfer Bandara LOP & Inkuiri
 * LOMBOK NUSANTARA TRAVEL — PT Lombok Nusantara Wisata
 * File: api.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

$pdo = getDatabaseConnection();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Membaca body JSON dari request POST / PUT
 */
function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

try {
    switch ($action) {
        // ---------------------------------------------------------------------
        // 1. GET Daftar Paket Wisata Aktif
        // ---------------------------------------------------------------------
        case 'list_packages':
            $stmt = $pdo->query('SELECT * FROM `packages` WHERE `is_active` = 1 ORDER BY `id` ASC');
            sendJsonResponse([
                'status' => 'success',
                'data'   => $stmt->fetchAll()
            ]);
            break;

        // ---------------------------------------------------------------------
        // 2. POST Buat Reservasi Paket Wisata Baru (bookings)
        // ---------------------------------------------------------------------
        case 'create_booking':
            if ($method !== 'POST') {
                sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
            $input = getJsonInput();

            $bookingRef   = substr(trim((string)($input['bookingRef'] ?? '')), 0, 32);
            $packageId    = substr(trim((string)($input['packageId'] ?? '')), 0, 64);
            $packageTitle = substr(trim((string)($input['packageTitle'] ?? '')), 0, 160);
            $travelDate   = substr(trim((string)($input['travelDate'] ?? '')), 0, 20);
            $pax          = max(1, min(200, (int)($input['pax'] ?? 2)));
            $totalIdr     = max(0, (int)($input['totalPriceIdr'] ?? 0));
            $totalUsd     = max(0, (int)($input['totalPriceUsd'] ?? 0));
            $addOns       = substr(trim((string)($input['addOns'] ?? '')), 0, 200);
            $guestName    = substr(trim((string)($input['guestName'] ?? '')), 0, 100);
            $guestContact = substr(trim((string)($input['guestContact'] ?? '')), 0, 120);
            $pickupNotes  = substr(trim((string)($input['pickupNotes'] ?? '')), 0, 300);

            if (strlen($guestName) < 2 || strlen($guestContact) < 5 || empty($packageId)) {
                sendJsonResponse([
                    'status'  => 'error',
                    'message' => 'Data nama pemesan, kontak WhatsApp/Email, dan paket wajib diisi.'
                ], 422);
            }

            if (empty($bookingRef)) {
                $bookingRef = 'LNT-' . strtoupper(substr(md5(uniqid('', true)), 0, 6));
            }

            $sql = 'INSERT INTO `bookings`
                    (`booking_ref`, `package_id`, `package_title`, `travel_date`, `pax`,
                     `total_price_idr`, `total_price_usd`, `add_ons`, `guest_name`, `guest_contact`, `pickup_notes`, `status`)
                    VALUES
                    (:booking_ref, :package_id, :package_title, :travel_date, :pax,
                     :total_price_idr, :total_price_usd, :add_ons, :guest_name, :guest_contact, :pickup_notes, "pending")';

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':booking_ref'     => $bookingRef,
                ':package_id'      => $packageId,
                ':package_title'   => $packageTitle,
                ':travel_date'     => $travelDate,
                ':pax'             => $pax,
                ':total_price_idr' => $totalIdr,
                ':total_price_usd' => $totalUsd,
                ':add_ons'         => $addOns,
                ':guest_name'      => $guestName,
                ':guest_contact'   => $guestContact,
                ':pickup_notes'    => $pickupNotes,
            ]);

            sendJsonResponse([
                'status'      => 'success',
                'message'     => 'Reservasi paket wisata berhasil disimpan ke database SQL.',
                'booking_id'  => (int)$pdo->lastInsertId(),
                'booking_ref' => $bookingRef
            ], 201);
            break;

        // ---------------------------------------------------------------------
        // 3. POST Buat Reservasi Transfer Bandara LOP (transfers)
        // ---------------------------------------------------------------------
        case 'create_transfer':
            if ($method !== 'POST') {
                sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
            $input = getJsonInput();

            $routeId     = substr(trim((string)($input['routeId'] ?? '')), 0, 64);
            $routeName   = substr(trim((string)($input['routeName'] ?? '')), 0, 160);
            $vehicleType = in_array($input['vehicleType'] ?? '', ['avanza', 'innova', 'hiace'], true)
                ? $input['vehicleType']
                : 'innova';
            $pickupDate  = substr(trim((string)($input['pickupDate'] ?? '')), 0, 20);
            $flightCode  = substr(trim((string)($input['flightCode'] ?? '')), 0, 60);
            $priceIdr    = max(0, (int)($input['priceIdr'] ?? 0));
            $priceUsd    = max(0, (int)($input['priceUsd'] ?? 0));

            $sql = 'INSERT INTO `transfers`
                    (`route_id`, `route_name`, `vehicle_type`, `pickup_date`, `flight_code`, `price_idr`, `price_usd`, `status`)
                    VALUES
                    (:route_id, :route_name, :vehicle_type, :pickup_date, :flight_code, :price_idr, :price_usd, "pending")';

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':route_id'     => $routeId,
                ':route_name'   => $routeName,
                ':vehicle_type' => $vehicleType,
                ':pickup_date'  => $pickupDate,
                ':flight_code'  => $flightCode,
                ':price_idr'    => $priceIdr,
                ':price_usd'    => $priceUsd,
            ]);

            sendJsonResponse([
                'status'      => 'success',
                'message'     => 'Jadwal penjemputan Bandara LOP berhasil disimpan ke database SQL.',
                'transfer_id' => (int)$pdo->lastInsertId()
            ], 201);
            break;

        // ---------------------------------------------------------------------
        // 4. POST Buat Inkuiri Itinerary Custom / MICE (inquiries)
        // ---------------------------------------------------------------------
        case 'create_inquiry':
            if ($method !== 'POST') {
                sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
            $input = getJsonInput();

            $guestName   = substr(trim((string)($input['guestName'] ?? '')), 0, 100);
            $contactInfo = substr(trim((string)($input['contactInfo'] ?? '')), 0, 120);
            $segment     = substr(trim((string)($input['segment'] ?? 'Keluarga / Privat')), 0, 80);
            $paxCount    = max(1, min(500, (int)($input['paxCount'] ?? 2)));
            $notes       = substr(trim((string)($input['notes'] ?? '')), 0, 500);

            if (strlen($guestName) < 2 || strlen($contactInfo) < 5) {
                sendJsonResponse([
                    'status'  => 'error',
                    'message' => 'Nama lengkap dan kontak wajib diisi.'
                ], 422);
            }

            $sql = 'INSERT INTO `inquiries`
                    (`guest_name`, `contact_info`, `segment`, `pax_count`, `notes`, `status`)
                    VALUES
                    (:guest_name, :contact_info, :segment, :pax_count, :notes, "new")';

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':guest_name'   => $guestName,
                ':contact_info' => $contactInfo,
                ':segment'      => $segment,
                ':pax_count'    => $paxCount,
                ':notes'        => $notes,
            ]);

            sendJsonResponse([
                'status'     => 'success',
                'message'    => 'Permintaan itinerary berhasil disimpan ke database SQL.',
                'inquiry_id' => (int)$pdo->lastInsertId()
            ], 201);
            break;

        // ---------------------------------------------------------------------
        // 5. GET Semua Data Reservasi (Untuk Dashboard Admin)
        // ---------------------------------------------------------------------
        case 'list_all':
            $bookings  = $pdo->query('SELECT * FROM `bookings` ORDER BY `created_at` DESC LIMIT 100')->fetchAll();
            $transfers = $pdo->query('SELECT * FROM `transfers` ORDER BY `created_at` DESC LIMIT 100')->fetchAll();
            $inquiries = $pdo->query('SELECT * FROM `inquiries` ORDER BY `created_at` DESC LIMIT 100')->fetchAll();

            sendJsonResponse([
                'status'    => 'success',
                'bookings'  => $bookings,
                'transfers' => $transfers,
                'inquiries' => $inquiries
            ]);
            break;

        default:
            sendJsonResponse([
                'status'    => 'ok',
                'service'   => 'LOMBOK NUSANTARA TRAVEL — PHP PDO + MySQL REST API',
                'endpoints' => [
                    'GET  api.php?action=list_packages',
                    'GET  api.php?action=list_all',
                    'POST api.php?action=create_booking',
                    'POST api.php?action=create_transfer',
                    'POST api.php?action=create_inquiry'
                ]
            ]);
    }
} catch (Throwable $e) {
    error_log('API Error: ' . $e->getMessage());
    sendJsonResponse([
        'status'  => 'error',
        'message' => 'Terjadi kesalahan saat memproses permintaan database.'
    ], 500);
}
