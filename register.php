<?php
include 'db.php';

$message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $conn->real_escape_string($_POST['name']);
    $position = $conn->real_escape_string($_POST['position']);
    $department = $conn->real_escape_string($_POST['department']);
    $email = $conn->real_escape_string($_POST['email']);
    $phone = $conn->real_escape_string($_POST['phone']);

    // Simple validation
    if (empty($name) || empty($position) || empty($department) || empty($email)) {
        $message = "Please fill in all required fields.";
    } else {
        // Insert participant
        $sql = "INSERT INTO participants (name, position, department, email, phone) VALUES ('$name', '$position', '$department', '$email', '$phone')";
        if ($conn->query($sql) === TRUE) {
            $message = "Registration successful!";
        } else {
            if ($conn->errno == 1062) {
                $message = "Email already registered.";
            } else {
                $message = "Error: " . $conn->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Berqurban Bersama UNP Peduli - Registration</title>
</head>
<body>
    <h2>Participant Registration</h2>
    <?php if ($message != ''): ?>
        <p><?php echo $message; ?></p>
    <?php endif; ?>
    <form method="post" action="register.php">
        <label for="name">Name*:</label><br>
        <input type="text" id="name" name="name" required><br><br>

        <label for="position">Position* (Dosen/Karyawan):</label><br>
        <input type="text" id="position" name="position" required><br><br>

        <label for="department">Department*:</label><br>
        <input type="text" id="department" name="department" required><br><br>

        <label for="email">Email*:</label><br>
        <input type="email" id="email" name="email" required><br><br>

        <label for="phone">Phone:</label><br>
        <input type="text" id="phone" name="phone"><br><br>

        <input type="submit" value="Register">
    </form>
</body>
</html>
