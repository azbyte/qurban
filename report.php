<?php
include 'db.php';

// Fetch participants with total deductions
$sql = "SELECT p.id, p.name, p.position, p.department, SUM(d.amount) AS total_deduction
        FROM participants p
        LEFT JOIN deductions d ON p.id = d.participant_id
        GROUP BY p.id, p.name, p.position, p.department
        ORDER BY p.name";

$result = $conn->query($sql);

$total_all = 0;
?>

<!DOCTYPE html>
<html>
<head>
    <title>Berqurban Bersama UNP Peduli - Deduction Report</title>
</head>
<body>
    <h2>Qurban Deduction Report for Lebaran Haji 1447 H</h2>
    <table border="1" cellpadding="5" cellspacing="0">
        <thead>
            <tr>
                <th>Participant Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Total Deduction (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <?php if ($result && $result->num_rows > 0): ?>
                <?php while ($row = $result->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['name']); ?></td>
                        <td><?php echo htmlspecialchars($row['position']); ?></td>
                        <td><?php echo htmlspecialchars($row['department']); ?></td>
                        <td style="text-align:right;"><?php echo number_format($row['total_deduction'], 2); ?></td>
                    </tr>
                    <?php $total_all += $row['total_deduction']; ?>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="4">No data available.</td></tr>
            <?php endif; ?>
        </tbody>
        <tfoot>
            <tr>
                <th colspan="3" style="text-align:right;">Total All Deductions (Rp):</th>
                <th style="text-align:right;"><?php echo number_format($total_all, 2); ?></th>
            </tr>
        </tfoot>
    </table>
</body>
</html>
