<?php
include 'db.php';

$message = '';

// Fetch participants for dropdown
$participants = [];
$result = $conn->query("SELECT id, name FROM participants ORDER BY name");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $participants[] = $row;
    }
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $participant_id = intval($_POST['participant_id']);
    $month_year = $conn->real_escape_string($_POST['month_year']);
    $amount = floatval($_POST['amount']);

    if ($participant_id <= 0 || empty($month_year) || $amount <= 0) {
        $message = "Please fill in all fields with valid values.";
    } else {
        // Check if deduction exists for participant and month_year
        $check_sql = "SELECT id FROM deductions WHERE participant_id = $participant_id AND month_year = '$month_year'";
        $check_result = $conn->query($check_sql);
        if ($check_result && $check_result->num_rows > 0) {
            // Update existing deduction
            $update_sql = "UPDATE deductions SET amount = $amount WHERE participant_id = $participant_id AND month_year = '$month_year'";
            if ($conn->query($update_sql) === TRUE) {
                $message = "Deduction updated successfully.";
            } else {
                $message = "Error updating deduction: " . $conn->error;
            }
        } else {
            // Insert new deduction
            $insert_sql = "INSERT INTO deductions (participant_id, month_year, amount) VALUES ($participant_id, '$month_year', $amount)";
            if ($conn->query($insert_sql) === TRUE) {
                $message = "Deduction added successfully.";
            } else {
                $message = "Error adding deduction: " . $conn->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Berqurban Bersama UNP Peduli - Payroll Input</title>
</head>
<body>
    <h2>Payroll Monthly Deduction Input</h2>
    <?php if ($message != ''): ?>
        <p><?php echo $message; ?></p>
    <?php endif; ?>
    <form method="post" action="payroll.php">
        <label for="participant_id">Participant*:</label><br>
        <select id="participant_id" name="participant_id" required>
            <option value="">-- Select Participant --</option>
            <?php foreach ($participants as $p): ?>
                <option value="<?php echo $p['id']; ?>"><?php echo htmlspecialchars($p['name']); ?></option>
            <?php endforeach; ?>
        </select><br><br>

        <label for="month_year">Month-Year* (format YYYY-MM):</label><br>
        <input type="month" id="month_year" name="month_year" required><br><br>

        <label for="amount">Deduction Amount*:</label><br>
        <input type="number" step="0.01" id="amount" name="amount" required><br><br>

        <input type="submit" value="Submit Deduction">
    </form>
</body>
</html>
