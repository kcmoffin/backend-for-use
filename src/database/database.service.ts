import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  pool!: mysql.Pool;

  async onModuleInit() {
    const host = process.env.DB_HOST || 'localhost';
    const isCloudHost = host.includes('aivencloud.com') || host.includes('aws') || host.includes('render');

    this.pool = mysql.createPool({
      host,
      port: +(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Aiven and cloud databases mandate SSL/TLS
      ssl: isCloudHost ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const conn = await this.pool.getConnection();
      await conn.ping();

      // Ensure 'users' table exists for MySQL Workbench and Postman
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          refresh_token TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Safely ensure columns exist if users table already existed in MySQL Workbench
      const safeMigrations = [
        'ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT "user"',
        'ALTER TABLE users ADD COLUMN refresh_token TEXT NULL',
        'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      ];

      for (const sql of safeMigrations) {
        try {
          await conn.execute(sql);
        } catch {
          // Column already exists, safe to ignore
        }
      }

      conn.release();
      console.log('MySQL pool connected and users table verified successfully');
    } catch (err: any) {
      console.error('MySQL connection error in DatabaseService:', err.message);
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool() {
    return this.pool;
  }
}
