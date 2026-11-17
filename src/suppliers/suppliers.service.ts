
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class SuppliersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE supplier
  async createSupplier(
    supplier_name: string,
    supplier_address: string,
    supplier_phone: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO suppliers
       (supplier_name, supplier_address, supplier_phone)
       VALUES (?, ?, ?)`,
      [supplier_name, supplier_address, supplier_phone],
    );

    return {
      supplier_id: result.insertId,
      supplier_name,
      supplier_address,
      supplier_phone,
    };
  }

  // GET supplier by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM suppliers WHERE supplier_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return rows[0];
  }

  // GET all suppliers
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM suppliers',
    );

    return rows;
  }

  // UPDATE supplier
  async updateSupplier(
    id: number,
    partial: {
      supplier_name?: string;
      supplier_address?: string;
      supplier_phone?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.supplier_name !== undefined) {
      fields.push('supplier_name = ?');
      values.push(partial.supplier_name);
    }

    if (partial.supplier_address !== undefined) {
      fields.push('supplier_address = ?');
      values.push(partial.supplier_address);
    }

    if (partial.supplier_phone !== undefined) {
      fields.push('supplier_phone = ?');
      values.push(partial.supplier_phone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE suppliers
      SET ${fields.join(', ')}
      WHERE supplier_id = ?
    `;

    const [result] = await this.pool().execute<OkPacket>(sql, values);

    if (result.affectedRows === 0) {
      return this.findById(id);
    }

    return this.findById(id);
  }

  // DELETE supplier
  async deleteSupplier(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM suppliers WHERE supplier_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return { message: 'Supplier deleted successfully' };
  }
}
