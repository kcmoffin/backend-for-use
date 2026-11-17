
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [BuyersController],
  providers: [BuyersService],
  exports: [BuyersService],
})
export class BuyersModule {}
