
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class BuyersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE - Add a new buyer
  async createBuyer(
    buyers_name: string,
    buyers_address: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO buyers (buyers_name, buyers_address)
       VALUES (?, ?)`,
      [buyers_name, buyers_address],
    );

    return {
      buyers_id: result.insertId,
      buyers_name,
      buyers_address,
    };
  }

  // READ - Get all buyers
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM buyers',
    );

    return rows;
  }

  // READ - Get one buyer by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM buyers WHERE buyers_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }

    return rows[0];
  }

  // UPDATE - Edit buyer information
  async updateBuyer(
    id: number,
    partial: {
      buyers_name?: string;
      buyers_address?: string;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.buyers_name !== undefined) {
      fields.push('buyers_name = ?');
      values.push(partial.buyers_name);
    }

    if (partial.buyers_address !== undefined) {
      fields.push('buyers_address = ?');
      values.push(partial.buyers_address);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await this.pool().execute(
      `UPDATE buyers
       SET ${fields.join(', ')}
       WHERE buyers_id = ?`,
      values,
    );

    return this.findById(id);
  }

  // DELETE - Remove a buyer
  async deleteBuyer(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM buyers WHERE buyers_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }

    return {
      message: 'Buyer deleted successfully',
    };
  }
}
