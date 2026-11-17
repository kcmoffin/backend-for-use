
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class FishesService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE fish
  async createFish(
    fish_variety: string,
    fish_name: string,
    category_id: number,
    supplier_id: number,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO fishes
       (fish_variety, fish_name, category_id, supplier_id)
       VALUES (?, ?, ?, ?)`,
      [fish_variety, fish_name, category_id, supplier_id],
    );

    return {
      fish_id: result.insertId,
      fish_variety,
      fish_name,
      category_id,
      supplier_id,
    };
  }

  // GET fish by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM fishes WHERE fish_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Fish with ID ${id} not found`);
    }

    return rows[0];
  }

  // GET all fishes
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM fishes',
    );

    return rows;
  }

  // UPDATE fish
  async updateFish(
    id: number,
    partial: {
      fish_variety?: string;
      fish_name?: string;
      category_id?: number;
      supplier_id?: number;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (partial.fish_variety !== undefined) {
      fields.push('fish_variety = ?');
      values.push(partial.fish_variety);
    }

    if (partial.fish_name !== undefined) {
      fields.push('fish_name = ?');
      values.push(partial.fish_name);
    }

    if (partial.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(partial.category_id);
    }

    if (partial.supplier_id !== undefined) {
      fields.push('supplier_id = ?');
      values.push(partial.supplier_id);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `UPDATE fishes SET ${fields.join(', ')} WHERE fish_id = ?`;

    await this.pool().execute<OkPacket>(sql, values);

    return this.findById(id);
  }

  // DELETE fish
  async deleteFish(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM fishes WHERE fish_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Fish with ID ${id} not found`);
    }

    return { message: 'Fish deleted successfully' };
  }
}
