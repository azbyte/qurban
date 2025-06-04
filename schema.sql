-- Database schema for UNP Qurban application

CREATE DATABASE IF NOT EXISTS unpqurban;
USE unpqurban;

-- Table for participants (dosen and karyawan)
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for monthly salary deductions
CREATE TABLE IF NOT EXISTS deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- format YYYY-MM
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_deduction (participant_id, month_year)
);
