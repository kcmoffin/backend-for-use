
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class OrdersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE order
  async createOrder(
    buyers_id: number,
    fish_id: number,
    quantity: number,
    total_price: number,
    order_status: string = 'Pending',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO orders
       (buyers_id, fish_id, quantity, total_price, order_status)
       VALUES (?, ?, ?, ?, ?)`,
      [buyers_id, fish_id, quantity, total_price, order_status],
    );

    return {
      order_id: result.insertId,
      buyers_id,
      fish_id,
      quantity,
      total_price,
      order_status,
    };
  }

  // GET order by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE order_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return rows[0];
  }

  // GET all orders
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM orders',
    );

    return rows;
  }

  // UPDATE order
  async updateOrder(
    id: number,
    partial: {
      buyers_id?: number;
      fish_id?: number;
      quantity?: number;
      total_price?: number;
      order_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.buyers_id !== undefined) {
      fields.push('buyers_id = ?');
      values.push(partial.buyers_id);
    }

    if (partial.fish_id !== undefined) {
      fields.push('fish_id = ?');
      values.push(partial.fish_id);
    }

    if (partial.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(partial.quantity);
    }

    if (partial.total_price !== undefined) {
      fields.push('total_price = ?');
      values.push(partial.total_price);
    }

    if (partial.order_status !== undefined) {
      fields.push('order_status = ?');
      values.push(partial.order_status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`;

    const [result] = await this.pool().execute<OkPacket>(sql, values);

    if (result.affectedRows === 0) {
      return this.findById(id);
    }

    return this.findById(id);
  }

  // DELETE order
  async deleteOrder(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM orders WHERE order_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { message: 'Order deleted successfully' };
  }
}
