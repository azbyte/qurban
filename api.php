<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "uas_database"; // You can change this to your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

function validatePesertaInput($input) {
    $requiredFields = ['nama_peserta', 'nip_nidn', 'email', 'nomor_telepon', 'alamat', 'tanggal_daftar'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            return false;
        }
    }
    return true;
}

function validatePotonganInput($input) {
    $requiredFields = ['id_peserta', 'nilai_qurban_estimasi', 'tanggal_input'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            return false;
        }
    }
    return true;
}

if ($method === 'GET') {
    if ($path === 'peserta') {
        $result = $conn->query("SELECT * FROM peserta");
        $peserta = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $peserta[] = $row;
            }
        }
        echo json_encode($peserta);
    } elseif ($path === 'potongan') {
        $result = $conn->query("SELECT * FROM potongan");
        if (!$result) {
            http_response_code(500);
            echo json_encode(["error" => "Query error: " . $conn->error]);
            exit();
        }
        $potongan = [];
        while ($row = $result->fetch_assoc()) {
            $potongan[] = $row;
        }
        echo json_encode($potongan);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Invalid GET path"]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($path === 'peserta') {
        if (!validatePesertaInput($input)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input data for peserta"]);
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO peserta (nama_peserta, nip_nidn, email, nomor_telepon, alamat, tanggal_daftar) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $input['nama_peserta'], $input['nip_nidn'], $input['email'], $input['nomor_telepon'], $input['alamat'], $input['tanggal_daftar']);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error inserting peserta: " . $stmt->error]);
        }
        $stmt->close();
    } elseif ($path === 'potongan') {
        if (!validatePotonganInput($input)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input data for potongan"]);
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO potongan (id_peserta, nilai_qurban_estimasi, tanggal_input) VALUES (?, ?, ?)");
        $stmt->bind_param("ids", $input['id_peserta'], $input['nilai_qurban_estimasi'], $input['tanggal_input']);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error inserting potongan: " . $stmt->error]);
        }
        $stmt->close();
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Invalid POST path"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
