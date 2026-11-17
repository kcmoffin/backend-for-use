-- ============================================================
-- Database Schema for MySQL Workbench / Postman / Frontend
-- Database: defaultdb (or your local MySQL database)
-- ============================================================

-- Create database if not exists (for local MySQL Workbench)
-- CREATE DATABASE IF NOT EXISTS defaultdb;
-- USE defaultdb;

-- 1. Users Table (Core Auth & User Listing)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  refresh_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Category Table
CREATE TABLE IF NOT EXISTS category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(100) NOT NULL,
  category_name VARCHAR(255) NOT NULL
);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) NULL
);

-- 4. Fishes Table
CREATE TABLE IF NOT EXISTS fishes (
  fish_id INT AUTO_INCREMENT PRIMARY KEY,
  fish_variety VARCHAR(255) NOT NULL,
  fish_name VARCHAR(255) NOT NULL,
  category_id INT NULL,
  supplier_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Buyers Table
CREATE TABLE IF NOT EXISTS buyers (
  buyer_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) NULL
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  order_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Helpful Queries for MySQL Workbench & Postman Testing
-- ============================================================

-- View all users
-- SELECT user_id AS id, username, role, created_at FROM users;

-- Reset / Delete a user
-- DELETE FROM users WHERE username = 'testuser';
