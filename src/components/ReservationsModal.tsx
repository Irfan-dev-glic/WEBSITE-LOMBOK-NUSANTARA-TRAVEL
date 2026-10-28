import React, { useEffect, useState } from 'react';
import { X, Database, LogIn, LogOut, Copy, Check, Download, Code2 } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  db,
  signInWithGoogle,
  signOutUser,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { Language, Currency } from '../data/lombokData';

interface ReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  authReady: boolean;
  lang: Language;
  currency: Currency;
}

interface BookingDoc {
  id: string;
  ownerId: string;
  bookingRef: string;
  packageId: string;
  packageTitle: string;
  travelDate: string;
  pax: number;
  totalPriceIdr: number;
  totalPriceUsd: number;
  addOns: string;
  guestName: string;
  guestContact: string;
  pickupNotes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface TransferDoc {
  id: string;
  ownerId: string;
  routeId: string;
  routeName: string;
  vehicleType: 'avanza' | 'innova' | 'hiace';
  pickupDate: string;
  flightCode: string;
  priceIdr: number;
  priceUsd: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface InquiryDoc {
  id: string;
  ownerId: string;
  guestName: string;
  contactInfo: string;
  segment: string;
  paxCount: number;
  notes: string;
  status: 'new' | 'replied' | 'closed';
}

export const ReservationsModal: React.FC<ReservationsModalProps> = ({
  isOpen,
  onClose,
  user,
  authReady,
  lang,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'php-sql' | 'bookings' | 'transfers' | 'inquiries'>('php-sql');
  const [activeCodeFile, setActiveCodeFile] = useState<'database.sql' | 'config.php' | 'api.php'>('database.sql');
  const [dbHost, setDbHost] = useState<string>('127.0.0.1');
  const [dbName, setDbName] = useState<string>('lombok_nusantara_db');
  const [dbUser, setDbUser] = useState<string>('lombok_user');
  const [dbPass, setDbPass] = useState<string>('rahasia_database_anda');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [transfers, setTransfers] = useState<TransferDoc[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDoc[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const isAdmin = Boolean(
    user && user.emailVerified && user.email === 'muhammadhuasin9011@gmail.com'
  );

  useEffect(() => {
    if (!isOpen || !authReady || !user) {
      setBookings([]);
      setTransfers([]);
      setInquiries([]);
      return;
    }

    setLoadingData(true);

    const bookingsQuery = isAdmin
      ? collection(db, 'bookings')
      : query(collection(db, 'bookings'), where('ownerId', '==', user.uid));

    const transfersQuery = isAdmin
      ? collection(db, 'transfers')
      : query(collection(db, 'transfers'), where('ownerId', '==', user.uid));

    const inquiriesQuery = isAdmin
      ? collection(db, 'inquiries')
      : query(collection(db, 'inquiries'), where('ownerId', '==', user.uid));

    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snap) => {
        const list: BookingDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BookingDoc, 'id'>)
        }));
        setBookings(list);
        setLoadingData(false);
      },
      (err) => {
        setLoadingData(false);
        handleFirestoreError(err, OperationType.LIST, 'bookings');
      }
    );

    const unsubTransfers = onSnapshot(
      transfersQuery,
      (snap) => {
        const list: TransferDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TransferDoc, 'id'>)
        }));
        setTransfers(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'transfers');
      }
    );

    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snap) => {
        const list: InquiryDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InquiryDoc, 'id'>)
        }));
        setInquiries(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );

    return () => {
      unsubBookings();
      unsubTransfers();
      unsubInquiries();
    };
  }, [isOpen, authReady, user, isAdmin]);

  if (!isOpen) return null;

  const formatMoney = (idr: number, usd: number) =>
    currency === 'IDR' ? `Rp ${idr.toLocaleString('id-ID')}` : `$${usd.toLocaleString('en-US')}`;

  const escapeSql = (str: string) => str.replace(/'/g, "''");

  const getDatabaseSqlContent = () => {
    const liveBookingsInsert =
      bookings.length > 0
        ? `\n-- Data Reservasi Paket Wisata Aktif\nINSERT INTO \`bookings\` (\`booking_ref\`, \`package_id\`, \`package_title\`, \`travel_date\`, \`pax\`, \`total_price_idr\`, \`total_price_usd\`, \`add_ons\`, \`guest_name\`, \`guest_contact\`, \`pickup_notes\`, \`status\`) VALUES\n` +
          bookings
            .map(
              (b) =>
                `  ('${escapeSql(b.bookingRef)}', '${escapeSql(b.packageId)}', '${escapeSql(
                  b.packageTitle
                )}', '${escapeSql(b.travelDate)}', ${b.pax}, ${b.totalPriceIdr}, ${b.totalPriceUsd}, '${escapeSql(
                  b.addOns
                )}', '${escapeSql(b.guestName)}', '${escapeSql(b.guestContact)}', '${escapeSql(
                  b.pickupNotes
                )}', '${escapeSql(b.status)}')`
            )
            .join(',\n') +
          ';\n'
        : '';

    return `-- ============================================================================
-- DATABASE SCHEMA: LOMBOK NUSANTARA TRAVEL (MySQL / MariaDB)
-- File: database.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`${dbName}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`${dbName}\`;

-- 1. Tabel Paket Wisata (packages)
CREATE TABLE IF NOT EXISTS \`packages\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL,
  \`title_id\` VARCHAR(160) NOT NULL,
  \`title_en\` VARCHAR(160) NOT NULL,
  \`region\` ENUM('gili', 'mandalika', 'rinjani', 'pink-beach', 'culture', 'mice') NOT NULL,
  \`segment\` ENUM('domestik', 'honeymoon', 'internasional', 'korporat') NOT NULL,
  \`duration_days\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`min_pax\` INT UNSIGNED NOT NULL DEFAULT 2,
  \`max_pax\` INT UNSIGNED NOT NULL DEFAULT 20,
  \`price_idr\` BIGINT UNSIGNED NOT NULL,
  \`ota_price_idr\` BIGINT UNSIGNED NOT NULL,
  \`price_usd\` INT UNSIGNED NOT NULL,
  \`ota_price_usd\` INT UNSIGNED NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_packages_slug\` (\`slug\`),
  KEY \`idx_packages_region_segment\` (\`region\`, \`segment\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`packages\` (\`id\`, \`slug\`, \`title_id\`, \`title_en\`, \`region\`, \`segment\`, \`duration_days\`, \`min_pax\`, \`max_pax\`, \`price_idr\`, \`ota_price_idr\`, \`price_usd\`, \`ota_price_usd\`) VALUES
  ('pkg-3gili-private', 'snorkeling-3-gili-trawangan-meno-air', 'Eksplorasi 3 Gili & Konservasi Penyu (Glass Bottom Boat)', '3 Gili Islands Private Snorkeling & Turtle Sanctuary Charter', 'gili', 'domestik', 1, 2, 12, 650000, 820000, 45, 58),
  ('pkg-mandalika-3d2n', 'paket-wisata-lombok-mandalika-sade-3h2m', 'Pesona Mandalika, Bukit Merese & Warisan Sasak 3 Hari 2 Malam', 'Mandalika Coastline, Merese Hill & Sasak Heritage 3D2N Escape', 'mandalika', 'honeymoon', 3, 2, 20, 2450000, 3100000, 165, 210),
  ('pkg-rinjani-3d2n', 'paket-pendakian-gunung-rinjani-sembalun-3h2m', 'Ekspedisi Puncak Gunung Rinjani (3.726 mdpl) & Danau Segara Anak 3H2M', 'Mount Rinjani Summit (3,726m) & Segara Anak Crater Lake Trek 3D2N', 'rinjani', 'internasional', 3, 2, 10, 3450000, 4350000, 225, 290),
  ('pkg-pink-beach-private', 'tur-privat-pink-beach-pulau-pasir-gili-petelu', 'Private Boat Tour Pink Beach, Pulau Pasir & Gili Petelu Lombok Timur', 'East Lombok Pink Beach, Sandbar Island & Gili Petelu Private Boat Tour', 'pink-beach', 'honeymoon', 1, 2, 10, 780000, 980000, 52, 68),
  ('pkg-sade-benang-kelambu', 'tur-budaya-desa-sade-air-terjun-benang-kelambu', 'Jejak Budaya Sasak Desa Sade & Air Terjun Tirai Benang Kelambu', 'Sasak Cultural Heritage & Benang Kelambu Curtain Waterfall Day Tour', 'culture', 'domestik', 1, 2, 14, 590000, 750000, 40, 52),
  ('pkg-corporate-mice-4d3n', 'paket-gathering-kantor-mice-lombok-4h3m', 'Paket Gathering Korporat, Outbound & MICE Lombok Eksklusif 4H3M', 'Corporate Retreat, Team Outbound & MICE Mandalika Package 4D3N', 'mice', 'korporat', 4, 20, 150, 3650000, 4500000, 240, 295)
ON DUPLICATE KEY UPDATE \`price_idr\` = VALUES(\`price_idr\`), \`price_usd\` = VALUES(\`price_usd\`);

-- 2. Tabel Reservasi Paket Wisata (bookings)
CREATE TABLE IF NOT EXISTS \`bookings\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`booking_ref\` VARCHAR(32) NOT NULL,
  \`package_id\` VARCHAR(64) NOT NULL,
  \`package_title\` VARCHAR(160) NOT NULL,
  \`travel_date\` DATE NOT NULL,
  \`pax\` INT UNSIGNED NOT NULL DEFAULT 2,
  \`total_price_idr\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`total_price_usd\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`add_ons\` VARCHAR(200) DEFAULT '',
  \`guest_name\` VARCHAR(100) NOT NULL,
  \`guest_contact\` VARCHAR(120) NOT NULL,
  \`pickup_notes\` VARCHAR(300) DEFAULT '',
  \`status\` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_bookings_ref\` (\`booking_ref\`),
  CONSTRAINT \`fk_bookings_package\` FOREIGN KEY (\`package_id\`) REFERENCES \`packages\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Reservasi Transfer Bandara LOP (transfers)
CREATE TABLE IF NOT EXISTS \`transfers\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`route_id\` VARCHAR(64) NOT NULL,
  \`route_name\` VARCHAR(160) NOT NULL,
  \`vehicle_type\` ENUM('avanza', 'innova', 'hiace') NOT NULL DEFAULT 'innova',
  \`pickup_date\` DATE NOT NULL,
  \`flight_code\` VARCHAR(60) DEFAULT '',
  \`price_idr\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`price_usd\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`status\` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Inkuiri Custom & MICE (inquiries)
CREATE TABLE IF NOT EXISTS \`inquiries\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`guest_name\` VARCHAR(100) NOT NULL,
  \`contact_info\` VARCHAR(120) NOT NULL,
  \`segment\` VARCHAR(80) NOT NULL,
  \`pax_count\` INT UNSIGNED NOT NULL DEFAULT 2,
  \`notes\` VARCHAR(500) DEFAULT '',
  \`status\` ENUM('new', 'replied', 'closed') NOT NULL DEFAULT 'new',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
${liveBookingsInsert}`;
  };

  const getConfigPhpContent = () => `<?php
/**
 * Konfigurasi Koneksi Database PDO (MySQL / MariaDB)
 * LOMBOK NUSANTARA TRAVEL — PT Lombok Nusantara Wisata
 * File: backend-php-sql/config.php
 */

declare(strict_types=1);

define('DB_HOST', '${dbHost}');
define('DB_PORT', '3306');
define('DB_NAME', '${dbName}');
define('DB_USER', '${dbUser}');
define('DB_PASS', '${dbPass}');
define('DB_CHARSET', 'utf8mb4');

date_default_timezone_set('Asia/Makassar');

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
                'message' => 'Gagal terhubung ke database SQL.'
            ]);
            exit;
        }
    }

    return $pdo;
}

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
`;

  const getApiPhpContent = () => `<?php
/**
 * REST API Endpoint PHP & SQL (PDO Prepared Statements)
 * LOMBOK NUSANTARA TRAVEL — PT Lombok Nusantara Wisata
 * File: backend-php-sql/api.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJsonResponse(['status' => 'ok']);
}

$pdo = getDatabaseConnection();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

switch ($action) {
    case 'list_packages':
        $stmt = $pdo->query('SELECT * FROM \`packages\` WHERE \`is_active\` = 1 ORDER BY \`id\` ASC');
        sendJsonResponse(['status' => 'success', 'data' => $stmt->fetchAll()]);
        break;

    case 'create_booking':
        if ($method !== 'POST') sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $in = getJsonInput();
        $sql = 'INSERT INTO \`bookings\`
                (\`booking_ref\`, \`package_id\`, \`package_title\`, \`travel_date\`, \`pax\`,
                 \`total_price_idr\`, \`total_price_usd\`, \`add_ons\`, \`guest_name\`, \`guest_contact\`, \`pickup_notes\`, \`status\`)
                VALUES
                (:booking_ref, :package_id, :package_title, :travel_date, :pax,
                 :total_price_idr, :total_price_usd, :add_ons, :guest_name, :guest_contact, :pickup_notes, "pending")';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':booking_ref'     => substr(trim((string)($in['bookingRef'] ?? '')), 0, 32),
            ':package_id'      => substr(trim((string)($in['packageId'] ?? '')), 0, 64),
            ':package_title'   => substr(trim((string)($in['packageTitle'] ?? '')), 0, 160),
            ':travel_date'     => substr(trim((string)($in['travelDate'] ?? '')), 0, 20),
            ':pax'             => max(1, min(200, (int)($in['pax'] ?? 2))),
            ':total_price_idr' => max(0, (int)($in['totalPriceIdr'] ?? 0)),
            ':total_price_usd' => max(0, (int)($in['totalPriceUsd'] ?? 0)),
            ':add_ons'         => substr(trim((string)($in['addOns'] ?? '')), 0, 200),
            ':guest_name'      => substr(trim((string)($in['guestName'] ?? '')), 0, 100),
            ':guest_contact'   => substr(trim((string)($in['guestContact'] ?? '')), 0, 120),
            ':pickup_notes'    => substr(trim((string)($in['pickupNotes'] ?? '')), 0, 300),
        ]);
        sendJsonResponse(['status' => 'success', 'booking_id' => (int)$pdo->lastInsertId()], 201);
        break;

    case 'create_transfer':
        if ($method !== 'POST') sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $in = getJsonInput();
        $stmt = $pdo->prepare('INSERT INTO \`transfers\` (\`route_id\`, \`route_name\`, \`vehicle_type\`, \`pickup_date\`, \`flight_code\`, \`price_idr\`, \`price_usd\`, \`status\`) VALUES (:route_id, :route_name, :vehicle_type, :pickup_date, :flight_code, :price_idr, :price_usd, "pending")');
        $stmt->execute([
            ':route_id'     => substr(trim((string)($in['routeId'] ?? '')), 0, 64),
            ':route_name'   => substr(trim((string)($in['routeName'] ?? '')), 0, 160),
            ':vehicle_type' => in_array($in['vehicleType'] ?? '', ['avanza', 'innova', 'hiace'], true) ? $in['vehicleType'] : 'innova',
            ':pickup_date'  => substr(trim((string)($in['pickupDate'] ?? '')), 0, 20),
            ':flight_code'  => substr(trim((string)($in['flightCode'] ?? '')), 0, 60),
            ':price_idr'    => max(0, (int)($in['priceIdr'] ?? 0)),
            ':price_usd'    => max(0, (int)($in['priceUsd'] ?? 0)),
        ]);
        sendJsonResponse(['status' => 'success', 'transfer_id' => (int)$pdo->lastInsertId()], 201);
        break;

    case 'create_inquiry':
        if ($method !== 'POST') sendJsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $in = getJsonInput();
        $stmt = $pdo->prepare('INSERT INTO \`inquiries\` (\`guest_name\`, \`contact_info\`, \`segment\`, \`pax_count\`, \`notes\`, \`status\`) VALUES (:guest_name, :contact_info, :segment, :pax_count, :notes, "new")');
        $stmt->execute([
            ':guest_name'   => substr(trim((string)($in['guestName'] ?? '')), 0, 100),
            ':contact_info' => substr(trim((string)($in['contactInfo'] ?? '')), 0, 120),
            ':segment'      => substr(trim((string)($in['segment'] ?? 'Keluarga')), 0, 80),
            ':pax_count'    => max(1, min(500, (int)($in['paxCount'] ?? 2))),
            ':notes'        => substr(trim((string)($in['notes'] ?? '')), 0, 500),
        ]);
        sendJsonResponse(['status' => 'success', 'inquiry_id' => (int)$pdo->lastInsertId()], 201);
        break;

    default:
        sendJsonResponse(['status' => 'ok', 'service' => 'LOMBOK NUSANTARA TRAVEL PHP+SQL API']);
}
`;

  const currentCodeContent =
    activeCodeFile === 'database.sql'
      ? getDatabaseSqlContent()
      : activeCodeFile === 'config.php'
      ? getConfigPhpContent()
      : getApiPhpContent();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCodeContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([currentCodeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeCodeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogin = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    }
  };

  const handleBookingStatusChange = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const path = `bookings/${bookingId}`;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleTransferStatusChange = async (
    transferId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const path = `transfers/${transferId}`;
    try {
      await updateDoc(doc(db, 'transfers', transferId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleInquiryStatusChange = async (
    inquiryId: string,
    newStatus: 'new' | 'replied' | 'closed'
  ) => {
    const path = `inquiries/${inquiryId}`;
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Database PHP + MySQL & Manajemen Reservasi — LOMBOK NUSANTARA TRAVEL'
                  : 'PHP + MySQL Database Config & Reservation Manager — LOMBOK NUSANTARA TRAVEL'}
              </h2>
              <p className="text-xs text-slate-500">
                File tersedia di <span className="font-mono-num">/backend-php-sql/</span> (`database.sql`, `config.php`, `api.php`)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('php-sql')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'php-sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? 'Konfigurasi PHP & SQL' : 'PHP & SQL Config'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Tabel bookings (${bookings.length})` : `bookings Table (${bookings.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'transfers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Tabel transfers (${transfers.length})` : `transfers Table (${transfers.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'inquiries' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'id' ? `Tabel inquiries (${inquiries.length})` : `inquiries Table (${inquiries.length})`}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600">
                  {user.displayName || user.email}
                  {isAdmin && <strong className="ml-1.5 text-teal-800">(Admin)</strong>}
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Keluar' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Masuk dengan Google' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
              {authError}
            </div>
          )}

          {activeTab === 'php-sql' ? (
            <div className="space-y-5">
              {/* Interactive DB Credentials Customizer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-800">
                  {lang === 'id'
                    ? 'Sesuaikan Parameter Koneksi MySQL / MariaDB (Otomatis Memperbarui Kode config.php & database.sql):'
                    : 'Customize MySQL / MariaDB Connection Parameters (Auto-updates config.php & database.sql):'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">DB_HOST</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">DB_NAME</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">DB_USER</label>
                    <input
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">DB_PASS</label>
                    <input
                      type="text"
                      value={dbPass}
                      onChange={(e) => setDbPass(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono-num"
                    />
                  </div>
                </div>
              </div>

              {/* File Selector & Download/Copy Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['database.sql', 'config.php', 'api.php'] as const).map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => setActiveCodeFile(file)}
                      className={`px-3.5 py-2 text-xs font-mono-num font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeCodeFile === file
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{file}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Tersalin!' : `Salin ${activeCodeFile}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCode}
                    className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh {activeCodeFile}</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-100">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono-num text-slate-400">
                  <span>/backend-php-sql/{activeCodeFile}</span>
                  <span>PDO Prepared Statements · UTF8MB4 · InnoDB</span>
                </div>
                <pre className="p-4 text-xs font-mono-num leading-relaxed overflow-x-auto max-h-[380px]">
                  <code>{currentCodeContent}</code>
                </pre>
              </div>
            </div>
          ) : !user ? (
            <div className="py-12 text-center space-y-4 border border-slate-200 rounded-xl bg-slate-50 p-6">
              <div className="text-base font-semibold text-slate-900">
                {lang === 'id'
                  ? 'Silakan Masuk dengan Google untuk Mengelola Data Tabel Reservasi'
                  : 'Sign In with Google to View & Manage Reservation Table Records'}
              </div>
              <button
                type="button"
                onClick={handleLogin}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'id' ? 'Masuk dengan Akun Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : loadingData ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {lang === 'id' ? 'Memuat data tabel...' : 'Loading table records...'}
            </div>
          ) : activeTab === 'bookings' ? (
            bookings.length === 0 ? (
              <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
                <div className="text-sm font-semibold text-slate-900">
                  {lang === 'id' ? 'Tabel `bookings` masih kosong.' : 'Table `bookings` has no rows yet.'}
                </div>
                <p className="text-xs text-slate-600">
                  {lang === 'id'
                    ? 'Pilih salah satu paket wisata di beranda untuk menambahkan baris baru.'
                    : 'Select any tour package on the main page to insert a new booking row.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono-num font-semibold text-teal-800">{bk.bookingRef}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{bk.travelDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{bk.pax} Pax</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-mono-num font-semibold text-slate-800">
                          Status: {bk.status}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{bk.packageTitle}</div>
                      <div className="text-xs text-slate-600">
                        {bk.guestName} ({bk.guestContact}) {bk.addOns ? `· Add-ons: ${bk.addOns}` : ''}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono-num text-slate-900">
                          {formatMoney(bk.totalPriceIdr, bk.totalPriceUsd)}
                        </div>
                      </div>

                      {isAdmin ? (
                        <select
                          value={bk.status}
                          onChange={(e) =>
                            handleBookingStatusChange(
                              bk.id,
                              e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'
                            )
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      ) : (
                        bk.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleBookingStatusChange(bk.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                          >
                            {lang === 'id' ? 'Batalkan' : 'Cancel'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'transfers' ? (
            transfers.length === 0 ? (
              <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
                <div className="text-sm font-semibold text-slate-900">
                  {lang === 'id' ? 'Tabel `transfers` masih kosong.' : 'Table `transfers` has no rows yet.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-num">
                        <span className="text-teal-800 font-semibold uppercase">{tr.vehicleType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tr.pickupDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tr.flightCode || 'Flight TBA'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-semibold text-slate-800">Status: {tr.status}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{tr.routeName}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono-num text-slate-900">
                        {formatMoney(tr.priceIdr, tr.priceUsd)}
                      </span>
                      {isAdmin ? (
                        <select
                          value={tr.status}
                          onChange={(e) =>
                            handleTransferStatusChange(
                              tr.id,
                              e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled'
                            )
                          }
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      ) : (
                        tr.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleTransferStatusChange(tr.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                          >
                            {lang === 'id' ? 'Batalkan' : 'Cancel'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-2">
              <div className="text-sm font-semibold text-slate-900">
                {lang === 'id' ? 'Tabel `inquiries` masih kosong.' : 'Table `inquiries` has no rows yet.'}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-teal-800">{inq.segment}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{inq.paxCount} Pax</span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase font-mono-num font-semibold text-slate-800">
                        Status: {inq.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {inq.guestName} ({inq.contactInfo})
                    </div>
                    <p className="text-xs text-slate-600">{inq.notes || '-'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatusChange(
                            inq.id,
                            e.target.value as 'new' | 'replied' | 'closed'
                          )
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50"
                      >
                        <option value="new">new</option>
                        <option value="replied">replied</option>
                        <option value="closed">closed</option>
                      </select>
                    ) : (
                      inq.status !== 'closed' && (
                        <button
                          type="button"
                          onClick={() => handleInquiryStatusChange(inq.id, 'closed')}
                          className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
                        >
                          {lang === 'id' ? 'Tandai Selesai' : 'Close Inquiry'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
