
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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // GET all orders
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.ordersService.getAll();
  }

  // GET one order by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.ordersService.findById(+id);
  }

  // POST - Create an order
  @Post()
  async create(
    @Body()
    body: {
      buyers_id: number;
      fish_id: number;
      quantity: number;
      total_price: number;
      order_status?: string;
    },
  ) {
    return this.ordersService.createOrder(
      body.buyers_id,
      body.fish_id,
      body.quantity,
      body.total_price,
      body.order_status,
    );
  }

  // PUT - Update an order
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateOrder(+id, body);
  }

  // DELETE - Delete an order
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ordersService.deleteOrder(+id);
  }
}
