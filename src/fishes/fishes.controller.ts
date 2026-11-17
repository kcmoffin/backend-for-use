
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
import { FishesService } from './fishes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fishes')
export class FishesController {
  constructor(private fishesService: FishesService) {}

  // GET all fishes
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.fishesService.getAll();
  }

  // GET one fish by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.fishesService.findById(+id);
  }

  // POST - Create a fish
  @Post()
  async create(
    @Body()
    body: {
      fish_variety: string;
      fish_name: string;
      category_id: number;
      supplier_id: number;
    },
  ) {
    return this.fishesService.createFish(
      body.fish_variety,
      body.fish_name,
      body.category_id,
      body.supplier_id,
    );
  }

  // PUT - Update a fish
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.fishesService.updateFish(+id, body);
  }

  // DELETE - Delete a fish
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.fishesService.deleteFish(+id);
  }
}
