import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // Get all users (accessible for Postman listing and frontend dashboard)
  @Get()
  async getAll() {
    return this.userService.getAll();
  }

  // Get single user by id
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  // Create user (open - for demo)
  @Post()
  async create(@Body() body: { username: string; password: string; role?: string }) {
    return this.userService.createUser(body.username, body.password, body.role || 'user');
  }

  // Update user (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateUser(+id, body);
  }

  // Delete user (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.deleteUser(+id);
  }
}