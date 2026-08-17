<?php
/**
 * BSKbd.org MySQL & JSON Document API Endpoint
 * Production-Ready Backend with Server-Side Session Token Authentication
 */

error_reporting(0);
ini_set('display_errors', '0');

// Dynamic CORS Header - restricts to same origin or trusted domain
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigins = [
    'https://bskbd.org',
    'http://bskbd.org',
    'https://www.bskbd.org',
    'http://www.bskbd.org',
];

if (!empty($origin)) {
    if (in_array($origin, $allowedOrigins) || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false || strpos($origin, 'run.app') !== false) {
        header("Access-Control-Allow-Origin: {$origin}");
    } else {
        header("Access-Control-Allow-Origin: https://bskbd.org");
    }
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 1. Database Configuration (supports external config file or environment variables)
if (file_exists(__DIR__ . '/../db_config.php')) {
    include_once __DIR__ . '/../db_config.php';
} elseif (file_exists(__DIR__ . '/db_config.php')) {
    include_once __DIR__ . '/db_config.php';
}

$db_host = isset($db_host) ? $db_host : (getenv('DB_HOST') ?: 'localhost');
$db_user = isset($db_user) ? $db_user : (getenv('DB_USER') ?: 'bskbd_new');
$db_pass = isset($db_pass) ? $db_pass : (getenv('DB_PASS') ?: '@Oviovih400');
$db_name = isset($db_name) ? $db_name : (getenv('DB_NAME') ?: 'bskbd_new');
$server_secret = isset($server_secret) ? $server_secret : 'bsk_secure_secret_hash_2026_@Oviovih400_bskbd';

// 2. MySQL PDO Connection
$pdo = null;
$useMySQL = false;
$dbError = null;

try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $useMySQL = true;

    // Auto-create document table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `bsk_documents` (
        `id` VARCHAR(191) NOT NULL,
        `collection` VARCHAR(100) NOT NULL,
        `data` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`collection`, `id`),
        INDEX `idx_collection` (`collection`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

} catch (Exception $e) {
    $dbError = $e->getMessage();
    $useMySQL = false;
}

// Fallback directory for file storage
$dataDir = __DIR__ . '/api_data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Deny from all\n");
    @file_put_contents($dataDir . '/index.html', "");
}

function sanitize_collection($name) {
    return preg_replace('/[^a-zA-Z0-9_\-]/', '', $name);
}

// 3. Security Helper Functions
function generate_admin_token($username, $secret) {
    $payload = [
        'role' => 'bsk_admin',
        'user' => $username,
        'iat'  => time(),
        'exp'  => time() + (86400 * 30), // 30 Days valid
        'nonce'=> bin2hex(random_bytes(8))
    ];
    $encodedPayload = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $encodedPayload, $secret);
    return $encodedPayload . '.' . $signature;
}

function verify_admin_request($secret) {
    $token = null;
    
    // Check Authorization: Bearer <token>
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            $token = trim($matches[1]);
        }
    } elseif (isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $token = trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
    }
    
    if (!$token && function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
            $token = trim($matches[1]);
        } elseif (isset($headers['authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['authorization'], $matches)) {
            $token = trim($matches[1]);
        } elseif (isset($headers['X-Admin-Token'])) {
            $token = trim($headers['X-Admin-Token']);
        } elseif (isset($headers['x-admin-token'])) {
            $token = trim($headers['x-admin-token']);
        }
    }
    
    if (!$token) {
        $rawInput = file_get_contents('php://input');
        $parsed = json_decode($rawInput, true);
        if (isset($parsed['admin_token'])) {
            $token = $parsed['admin_token'];
        }
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Valid Admin Authorization Token required.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid token structure.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    list($encodedPayload, $signature) = $parts;
    $expectedSignature = hash_hmac('sha256', $encodedPayload, $secret);
    
    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Token signature verification failed.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $payload = json_decode(base64_decode($encodedPayload), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Admin session expired. Please log in again.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    return $payload;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 4. API Endpoints
switch ($action) {

    // Server-Side Admin Authentication Endpoint
    case 'admin_login':
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        $username = isset($input['username']) ? trim(strtolower($input['username'])) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';
        $passcode = isset($input['passcode']) ? trim($input['passcode']) : '';

        // Valid credentials check (supports username+password or PIN)
        $isValid = false;
        if (!empty($username) && !empty($password)) {
            if (($username === 'admin' || $username === 'bskadmin') && 
                ($password === 'bsk@2026' || $password === 'admin123' || $password === 'admin' || $password === '5656')) {
                $isValid = true;
            }
        } elseif (!empty($passcode)) {
            if ($passcode === '5656' || $passcode === 'bsk@2026') {
                $isValid = true;
                $username = 'bskadmin';
            }
        }

        if ($isValid) {
            $token = generate_admin_token($username ?: 'bskadmin', $server_secret);
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'username' => $username,
                    'role' => 'admin'
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।'
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;

    // Public Read Collection
    case 'get_collection':
        $collection = isset($_GET['name']) ? sanitize_collection($_GET['name']) : '';
        if (empty($collection)) {
            echo json_encode([]);
            exit;
        }

        if ($useMySQL && $pdo) {
            try {
                $stmt = $pdo->prepare("SELECT `data` FROM `bsk_documents` WHERE `collection` = ?");
                $stmt->execute([$collection]);
                $rows = $stmt->fetchAll();
                
                $items = [];
                foreach ($rows as $row) {
                    $decoded = json_decode($row['data'], true);
                    if ($decoded !== null) {
                        $items[] = $decoded;
                    }
                }

                usort($items, function($a, $b) {
                    $orderA = isset($a['order']) ? (int)$a['order'] : 0;
                    $orderB = isset($b['order']) ? (int)$b['order'] : 0;
                    return $orderA <=> $orderB;
                });

                echo json_encode(array_values($items), JSON_UNESCAPED_UNICODE);
                exit;
            } catch (Exception $e) {
                // Fallback
            }
        }

        // File-based fallback
        $filePath = $dataDir . '/' . $collection . '.json';
        if (!file_exists($filePath)) {
            echo json_encode([]);
            exit;
        }
        $content = @file_get_contents($filePath);
        $data = json_decode($content, true);
        echo json_encode($data ? array_values($data) : [], JSON_UNESCAPED_UNICODE);
        exit;

    // Public Read Single Document
    case 'get_doc':
        $collection = isset($_GET['collection']) ? sanitize_collection($_GET['collection']) : '';
        $id = isset($_GET['id']) ? $_GET['id'] : '';

        if (empty($collection) || empty($id)) {
            echo json_encode(null);
            exit;
        }

        if ($useMySQL && $pdo) {
            try {
                $stmt = $pdo->prepare("SELECT `data` FROM `bsk_documents` WHERE `collection` = ? AND `id` = ? LIMIT 1");
                $stmt->execute([$collection, $id]);
                $row = $stmt->fetch();
                if ($row && !empty($row['data'])) {
                    echo $row['data'];
                } else {
                    echo json_encode(null);
                }
                exit;
            } catch (Exception $e) {
                // Fallback
            }
        }

        // File-based fallback
        $filePath = $dataDir . '/' . $collection . '.json';
        if (!file_exists($filePath)) {
            echo json_encode(null);
            exit;
        }
        $content = @file_get_contents($filePath);
        $data = json_decode($content, true);
        $found = null;
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['id']) && $item['id'] === $id) {
                    $found = $item;
                    break;
                }
            }
        }
        echo json_encode($found, JSON_UNESCAPED_UNICODE);
        exit;

    // Protected Create / Update Document (Requires Admin Token)
    case 'set_doc':
        // Require valid server-side admin authentication token
        verify_admin_request($server_secret);

        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        $collection = isset($input['collection']) ? sanitize_collection($input['collection']) : '';
        $id = isset($input['id']) ? $input['id'] : '';
        $docData = isset($input['data']) ? $input['data'] : null;

        if (empty($collection) || empty($id) || $docData === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Collection, ID, and Data are required']);
            exit;
        }

        if (is_array($docData)) {
            $docData['id'] = $id;
            if (!isset($docData['createdAt'])) {
                $docData['createdAt'] = date('c');
            }
            $docData['updatedAt'] = date('c');
        }

        $jsonEncoded = json_encode($docData, JSON_UNESCAPED_UNICODE);

        if ($useMySQL && $pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `bsk_documents` (`collection`, `id`, `data`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP");
                $stmt->execute([$collection, $id, $jsonEncoded]);
                echo json_encode(['success' => true, 'id' => $id, 'storage' => 'MySQL']);
                exit;
            } catch (Exception $e) {
                // Fallback
            }
        }

        // File-based fallback
        $filePath = $dataDir . '/' . $collection . '.json';
        $items = [];
        if (file_exists($filePath)) {
            $content = @file_get_contents($filePath);
            $items = json_decode($content, true);
            if (!is_array($items)) $items = [];
        }

        $updated = false;
        foreach ($items as $key => $item) {
            if (isset($item['id']) && $item['id'] === $id) {
                $items[$key] = $docData;
                $updated = true;
                break;
            }
        }
        if (!$updated) {
            $items[] = $docData;
        }

        @file_put_contents($filePath, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'id' => $id, 'storage' => 'File']);
        exit;

    // Protected Delete Document (Requires Admin Token)
    case 'delete_doc':
        // Require valid server-side admin authentication token
        verify_admin_request($server_secret);

        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);

        $collection = isset($input['collection']) ? sanitize_collection($input['collection']) : '';
        $id = isset($input['id']) ? $input['id'] : '';

        if (empty($collection) || empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Collection and ID are required']);
            exit;
        }

        if ($useMySQL && $pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM `bsk_documents` WHERE `collection` = ? AND `id` = ?");
                $stmt->execute([$collection, $id]);
                echo json_encode(['success' => true, 'storage' => 'MySQL']);
                exit;
            } catch (Exception $e) {
                // Fallback
            }
        }

        // File fallback
        $filePath = $dataDir . '/' . $collection . '.json';
        if (file_exists($filePath)) {
            $content = @file_get_contents($filePath);
            $items = json_decode($content, true);
            if (is_array($items)) {
                $items = array_values(array_filter($items, function($item) use ($id) {
                    return !isset($item['id']) || $item['id'] !== $id;
                }));
                @file_put_contents($filePath, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            }
        }
        echo json_encode(['success' => true, 'storage' => 'File']);
        exit;

    default:
        echo json_encode([
            'status' => 'online',
            'api_version' => '2.0-secure',
            'storage' => $useMySQL ? 'MySQL Connected' : 'JSON File Storage (Fallback)',
            'database' => $db_name,
            'auth' => 'HMAC-SHA256 Token Protection Enabled'
        ], JSON_PRETTY_PRINT);
        break;
}
