
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FishesService } from './fishes.service';
import { FishesController } from './fishes.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [FishesController],
  providers: [FishesService],
  exports: [FishesService],
})
export class FishesModule {}
