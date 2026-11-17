import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller(['auth', ''])
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @Post('register')
  async register(@Body() body: { username?: string; password?: string; role?: string }) {
    if (!body?.username || !body?.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.userService.createUser(body.username, body.password, body.role || 'user');
  }

  @Post('login')
  async login(@Body() body: { username?: string; password?: string }) {
    if (!body?.username || !body?.password) {
      throw new BadRequestException('Username and password are required');
    }
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.authService.login(user);
  }

  @Post('logout')
  async logout(@Body() body: { userId: number }) {
    if (!body?.userId) return { ok: true };
    return this.authService.logout(body.userId);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body?.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshTokens(body.refreshToken);
  }
}
