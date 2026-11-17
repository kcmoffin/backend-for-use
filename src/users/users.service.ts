import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createUser(username: string, password: string, role = 'user') {
    if (!username || !username.trim() || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const cleanUsername = username.trim();

    // Check if user already exists to avoid raw DB 500 error
    const existing = await this.findByUsername(cleanUsername);
    if (existing) {
      throw new ConflictException(`Username '${cleanUsername}' is already taken`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role?.trim() || 'user';

    try {
      const [result] = await this.pool().execute<OkPacket>(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [cleanUsername, hashedPassword, userRole],
      );

      return { id: result.insertId, username: cleanUsername, role: userRole };
    } catch (err: any) {
      // Fallback if role column is missing
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
        const [result] = await this.pool().execute<OkPacket>(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [cleanUsername, hashedPassword],
        );
        return { id: result.insertId, username: cleanUsername, role: 'user' };
      }

      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        throw new ConflictException(`Username '${cleanUsername}' is already taken`);
      }

      console.error('Error in createUser:', err);
      throw new InternalServerErrorException(err.message || 'Failed to create user in database');
    }
  }

  async findByUsername(username: string) {
    if (!username || !username.trim()) return null;

    try {
      const [rows] = await this.pool().execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE username = ?',
        [username.trim()],
      );

      if (!rows || rows.length === 0) return null;

      const r = rows[0];
      return {
        id: Number(r.user_id ?? r.id),
        username: r.username,
        password: r.password,
        role: r.role || 'user',
        refresh_token: r.refresh_token || null,
      };
    } catch (err: any) {
      console.error('Error in findByUsername:', err.message);
      throw new InternalServerErrorException('Database query failed: ' + err.message);
    }
  }

  async findById(id: number) {
    try {
      const [rows] = await this.pool().execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE user_id = ? OR id = ?',
        [id, id],
      );

      if (!rows || rows.length === 0) return null;

      const r = rows[0];
      return {
        id: Number(r.user_id ?? r.id),
        username: r.username,
        role: r.role || 'user',
        created_at: r.created_at,
      };
    } catch (err: any) {
      console.error('Error in findById:', err.message);
      return null;
    }
  }

  async getAll() {
    try {
      const [rows] = await this.pool().execute<RowDataPacket[]>(
        'SELECT * FROM users ORDER BY created_at DESC',
      );

      return rows.map((r) => ({
        id: Number(r.user_id ?? r.id),
        username: r.username,
        role: r.role || 'user',
        created_at: r.created_at,
      }));
    } catch {
      // Fallback if created_at column doesn't exist
      try {
        const [rows] = await this.pool().execute<RowDataPacket[]>(
          'SELECT * FROM users',
        );
        return rows.map((r) => ({
          id: Number(r.user_id ?? r.id),
          username: r.username,
          role: r.role || 'user',
          created_at: r.created_at,
        }));
      } catch (err: any) {
        console.error('Error in getAll:', err.message);
        throw new InternalServerErrorException('Database query failed: ' + err.message);
      }
    }
  }

  async updateUser(
    id: number,
    partial: { username?: string; password?: string; role?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username !== undefined) {
      fields.push('username = ?');
      values.push(partial.username.trim());
    }

    if (partial.password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(partial.password, 10));
    }

    if (partial.role !== undefined) {
      fields.push('role = ?');
      values.push(partial.role.trim());
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id, id);

    try {
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ? OR id = ?`;
      await this.pool().execute<OkPacket>(sql, values);
      return this.findById(id);
    } catch (err: any) {
      console.error('Error in updateUser:', err.message);
      throw new InternalServerErrorException('Failed to update user: ' + err.message);
    }
  }

  async deleteUser(id: number) {
    try {
      const [result] = await this.pool().execute<OkPacket>(
        'DELETE FROM users WHERE user_id = ? OR id = ?',
        [id, id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      console.error('Error in deleteUser:', err.message);
      throw new InternalServerErrorException('Failed to delete user: ' + err.message);
    }
  }

  async setRefreshToken(id: number, refreshToken: string | null) {
    try {
      await this.pool().execute(
        'UPDATE users SET refresh_token = ? WHERE user_id = ? OR id = ?',
        [refreshToken, id, id],
      );
    } catch (err: any) {
      console.warn('Could not update refresh_token in database:', err.message);
    }
  }

  async findByRefreshToken(refreshToken: string) {
    try {
      const [rows] = await this.pool().execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE refresh_token = ?',
        [refreshToken],
      );
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: Number(r.user_id ?? r.id),
        username: r.username,
        role: r.role || 'user',
      };
    } catch {
      return null;
    }
  }
}
