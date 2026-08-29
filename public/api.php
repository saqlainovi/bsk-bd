<?php
/**
 * BSK BD - Production Universal Database & Media Backend API
 * Database: bskbd_new | User: bskbd_new | Password: @Oviovih400
 */

error_reporting(0);
ini_set('display_errors', '0');
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');
@ini_set('memory_limit', '256M');

// 1. CORS Headers - Allow cross-domain requests between cms.bskbd.org, new.bskbd.org, and localhost
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: " . ($origin ? $origin : '*'));
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With, Origin, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 2. Permanent Hardcoded Database Credentials
$db_host = 'localhost';
$db_user = 'bskbd_new';
$db_pass = '@Oviovih400';
$db_name = 'bskbd_new';

// 3. MySQL Database Connection (PDO)
$pdo = null;
try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed: " . $e->getMessage(),
        "database" => $db_name
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 4. Auto-Provision Tables
$tables = [
    "website_pages" => "CREATE TABLE IF NOT EXISTS `website_pages` (
        `id` VARCHAR(191) PRIMARY KEY,
        `title_bn` VARCHAR(255) NULL,
        `title_en` VARCHAR(255) NULL,
        `data` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "bsk_documents" => "CREATE TABLE IF NOT EXISTS `bsk_documents` (
        `id` VARCHAR(191) NOT NULL,
        `collection` VARCHAR(100) NOT NULL,
        `data` LONGTEXT NOT NULL,
        `title_bn` VARCHAR(255) NULL,
        `title_en` VARCHAR(255) NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`, `collection`),
        INDEX `idx_col` (`collection`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "notices" => "CREATE TABLE IF NOT EXISTS `notices` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "events" => "CREATE TABLE IF NOT EXISTS `events` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "news_items" => "CREATE TABLE IF NOT EXISTS `news_items` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "job_circulars" => "CREATE TABLE IF NOT EXISTS `job_circulars` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "job_applications" => "CREATE TABLE IF NOT EXISTS `job_applications` (`id` VARCHAR(191) PRIMARY KEY, `circular_id` VARCHAR(191) NULL, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "blog_posts" => "CREATE TABLE IF NOT EXISTS `blog_posts` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "blog_reviews" => "CREATE TABLE IF NOT EXISTS `blog_reviews` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "press_releases" => "CREATE TABLE IF NOT EXISTS `press_releases` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "media_coverage" => "CREATE TABLE IF NOT EXISTS `media_coverage` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "hero_slides" => "CREATE TABLE IF NOT EXISTS `hero_slides` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "recent_activities" => "CREATE TABLE IF NOT EXISTS `recent_activities` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "inquiries" => "CREATE TABLE IF NOT EXISTS `inquiries` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "homepage_programs" => "CREATE TABLE IF NOT EXISTS `homepage_programs` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    "homepage_blocks" => "CREATE TABLE IF NOT EXISTS `homepage_blocks` (`id` VARCHAR(191) PRIMARY KEY, `data` LONGTEXT NOT NULL, `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
];

foreach ($tables as $t => $sql) {
    try { $pdo->exec($sql); } catch (Exception $ex) {}
}

// 5. Parse Action & Inputs
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$collection = isset($_GET['collection']) ? trim($_GET['collection']) : (isset($_GET['name']) ? trim($_GET['name']) : '');
$id = isset($_GET['id']) ? trim($_GET['id']) : '';

$raw_input = file_get_contents('php://input');
$payload = json_decode($raw_input, true) ?: [];

if (empty($collection) && !empty($payload['collection'])) {
    $collection = $payload['collection'];
}
if (empty($id) && !empty($payload['id'])) {
    $id = $payload['id'];
}

// 6. Action Handlers

// PING / HEALTH CHECK
if ($action === 'ping' || $action === 'status' || $action === 'get_db_status') {
    echo json_encode([
        "success" => true,
        "status" => "connected",
        "database" => $db_name,
        "host" => $db_host,
        "time" => date("Y-m-d H:i:s")
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// IMAGE & FILE UPLOAD
if ($action === 'upload_image' || $action === 'upload') {
    $fileData = null;
    $ext = 'jpg';
    $originalName = 'image.jpg';

    if (isset($_FILES['image']) || isset($_FILES['file'])) {
        $f = isset($_FILES['image']) ? $_FILES['image'] : $_FILES['file'];
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        $originalName = $f['name'];
        $fileData = file_get_contents($f['tmp_name']);
    } elseif (!empty($payload['image']) || !empty($payload['data'])) {
        $b64 = !empty($payload['image']) ? $payload['image'] : $payload['data'];
        if (preg_match('/^data:image\/(\w+);base64,/', $b64, $m)) {
            $ext = strtolower($m[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            $b64 = substr($b64, strpos($b64, ',') + 1);
        }
        $fileData = base64_decode($b64);
        $originalName = !empty($payload['filename']) ? $payload['filename'] : "upload.{$ext}";
    }

    if (!$fileData) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "No file data received."]);
        exit();
    }

    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $cleanExt = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'zip']) ? $ext : 'jpg';
    $newFileName = uniqid('bsk_', true) . '.' . $cleanExt;
    $targetPath = $uploadDir . $newFileName;

    if (file_put_contents($targetPath, $fileData)) {
        $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $dir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
        $fileUrl = "{$proto}{$host}{$dir}/uploads/{$newFileName}";

        echo json_encode([
            "success" => true,
            "url" => $fileUrl,
            "filename" => $newFileName,
            "original_name" => $originalName
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save file on server."]);
    }
    exit();
}

// GET COLLECTION
if ($action === 'get_collection' || $action === 'get_collection_server' || $action === 'getCollection' || $action === 'getDocs') {
    if (empty($collection)) {
        echo json_encode(["success" => true, "data" => []]);
        exit();
    }

    $tbl = preg_replace('/[^a-zA-Z0-9_]/', '', $collection);
    $rows = [];

    // Check specific table
    try {
        $stmt = $pdo->query("SELECT * FROM `{$tbl}`");
        while ($r = $stmt->fetch()) {
            $data = json_decode($r['data'], true);
            if ($data) {
                $data['id'] = $r['id'];
                $rows[] = $data;
            }
        }
    } catch (Exception $e) {
        // Fallback to bsk_documents
        try {
            $stmt = $pdo->prepare("SELECT * FROM `bsk_documents` WHERE `collection` = ?");
            $stmt->execute([$collection]);
            while ($r = $stmt->fetch()) {
                $data = json_decode($r['data'], true);
                if ($data) {
                    $data['id'] = $r['id'];
                    $rows[] = $data;
                }
            }
        } catch (Exception $e2) {}
    }

    echo json_encode(["success" => true, "data" => $rows], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET SINGLE DOC
if ($action === 'get_doc' || $action === 'get_doc_server' || $action === 'getDoc') {
    if (empty($collection) || empty($id)) {
        echo json_encode(["success" => false, "data" => null, "error" => "Missing collection or ID"]);
        exit();
    }

    $tbl = preg_replace('/[^a-zA-Z0-9_]/', '', $collection);
    $data = null;

    try {
        $stmt = $pdo->prepare("SELECT `data` FROM `{$tbl}` WHERE `id` = ? LIMIT 1");
        $stmt->execute([$id]);
        if ($r = $stmt->fetch()) {
            $data = json_decode($r['data'], true);
            if ($data) $data['id'] = $id;
        }
    } catch (Exception $e) {
        try {
            $stmt = $pdo->prepare("SELECT `data` FROM `bsk_documents` WHERE `collection` = ? AND `id` = ? LIMIT 1");
            $stmt->execute([$collection, $id]);
            if ($r = $stmt->fetch()) {
                $data = json_decode($r['data'], true);
                if ($data) $data['id'] = $id;
            }
        } catch (Exception $e2) {}
    }

    if ($data !== null) {
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["success" => false, "data" => null, "message" => "Not found"], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// SET / SAVE DOC
if ($action === 'set_doc' || $action === 'setDoc' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $target_col = !empty($collection) ? $collection : ($payload['collection'] ?? '');
    $target_id = !empty($id) ? $id : ($payload['id'] ?? '');
    $target_data = isset($payload['data']) ? $payload['data'] : $payload;

    if (empty($target_col) || empty($target_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing collection or document ID."]);
        exit();
    }

    $tbl = preg_replace('/[^a-zA-Z0-9_]/', '', $target_col);
    $jsonData = json_encode($target_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $title_bn = $target_data['title_bn'] ?? ($target_data['title'] ?? '');
    $title_en = $target_data['title_en'] ?? '';

    // Save to specific table if exists
    $saved = false;
    try {
        if ($tbl === 'website_pages') {
            $stmt = $pdo->prepare("INSERT INTO `website_pages` (`id`, `title_bn`, `title_en`, `data`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `title_bn` = VALUES(`title_bn`), `title_en` = VALUES(`title_en`), `data` = VALUES(`data`), `updated_at` = CURRENT_TIMESTAMP");
            $saved = $stmt->execute([$target_id, $title_bn, $title_en, $jsonData]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO `{$tbl}` (`id`, `data`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `data` = VALUES(`data`)");
            $saved = $stmt->execute([$target_id, $jsonData]);
        }
    } catch (Exception $e) {}

    // Also sync into bsk_documents for dual redundancy
    try {
        $stmt2 = $pdo->prepare("INSERT INTO `bsk_documents` (`id`, `collection`, `data`, `title_bn`, `title_en`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `title_bn` = VALUES(`title_bn`), `title_en` = VALUES(`title_en`), `updated_at` = CURRENT_TIMESTAMP");
        $stmt2->execute([$target_id, $target_col, $jsonData, $title_bn, $title_en]);
        $saved = true;
    } catch (Exception $e2) {}

    if ($saved) {
        echo json_encode(["success" => true, "id" => $target_id, "collection" => $target_col], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save to database."]);
    }
    exit();
}

// DELETE DOC
if ($action === 'delete_doc' || $action === 'deleteDoc' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $target_col = !empty($collection) ? $collection : ($payload['collection'] ?? '');
    $target_id = !empty($id) ? $id : ($payload['id'] ?? '');

    if (empty($target_col) || empty($target_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing collection or ID."]);
        exit();
    }

    $tbl = preg_replace('/[^a-zA-Z0-9_]/', '', $target_col);
    try {
        $pdo->prepare("DELETE FROM `{$tbl}` WHERE `id` = ?")->execute([$target_id]);
    } catch (Exception $e) {}

    try {
        $pdo->prepare("DELETE FROM `bsk_documents` WHERE `collection` = ? AND `id` = ?")->execute([$target_col, $target_id]);
    } catch (Exception $e) {}

    echo json_encode(["success" => true, "id" => $target_id]);
    exit();
}

echo json_encode(["success" => true, "message" => "BSK Backend Ready", "version" => "v18"]);
?>