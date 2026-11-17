
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
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('buyers')
export class BuyersController {
  constructor(private buyersService: BuyersService) {}

  // GET all buyers
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.buyersService.getAll();
  }

  // GET one buyer by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.buyersService.findById(+id);
  }

  // POST - Create a buyer
  @Post()
  async create(
    @Body()
    body: {
      buyers_name: string;
      buyers_address: string;
    },
  ) {
    return this.buyersService.createBuyer(
      body.buyers_name,
      body.buyers_address,
    );
  }

  // PUT - Update a buyer
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.buyersService.updateBuyer(+id, body);
  }

  // DELETE - Delete a buyer
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.buyersService.deleteBuyer(+id);
  }
}
