
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  // Get all suppliers
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.suppliersService.getAll();
  }

  // Get one supplier by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.suppliersService.findById(+id);
  }

  // Create supplier
  @Post()
  async create(
    @Body()
    body: {
      supplier_name: string;
      supplier_address: string;
      supplier_phone: string;
    },
  ) {
    return this.suppliersService.createSupplier(
      body.supplier_name,
      body.supplier_address,
      body.supplier_phone,
    );
  }

  // Update supplier
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.updateSupplier(+id, body);
  }

  // Delete supplier
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(+id);
  }
}
