CREATE DATABASE IF NOT EXISTS uas_database;
USE uas_database;

CREATE TABLE IF NOT EXISTS peserta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_peserta VARCHAR(255) NOT NULL,
    nip_nidn VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nomor_telepon VARCHAR(50) NOT NULL,
    alamat TEXT NOT NULL,
    tanggal_daftar DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS potongan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_peserta INT NOT NULL,
    nilai_qurban_estimasi DECIMAL(15,2) NOT NULL,
    tanggal_input DATE NOT NULL,
    FOREIGN KEY (id_peserta) REFERENCES peserta(id) ON DELETE CASCADE
);
