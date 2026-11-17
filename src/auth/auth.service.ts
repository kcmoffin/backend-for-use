import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string) {
    if (!username || !pass) return null;

    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    try {
      // 1. Try bcrypt hash comparison
      const valid = await bcrypt.compare(pass, user.password);
      if (valid) {
        return { id: user.id, username: user.username, role: user.role };
      }
    } catch {
      // In case password in DB is not a valid bcrypt hash
    }

    // 2. Fallback: check plain-text in case user was manually added in MySQL Workbench
    if (pass === user.password) {
      return { id: user.id, username: user.username, role: user.role };
    }

    return null;
  }

  async login(user: { id: number; username: string; role: string }) {
    try {
      const payload = { sub: user.id, username: user.username, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret';
      const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: '7d',
      });

      // Best effort save refresh token, don't fail login if table column has issues
      await this.usersService.setRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    } catch (err: any) {
      console.error('Error during login jwt generation:', err.message);
      throw new InternalServerErrorException('Failed to generate authentication tokens');
    }
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { ok: true };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret';
      const decoded: any = jwt.verify(refreshToken, refreshSecret);

      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      const newRefresh = jwt.sign(payload, refreshSecret, {
        expiresIn: '7d',
      });

      await this.usersService.setRefreshToken(user.id, newRefresh);
      return { accessToken, refreshToken: newRefresh };
    } catch (err: any) {
      throw new UnauthorizedException('Could not refresh token: ' + err.message);
    }
  }
}
