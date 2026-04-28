import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

@Module({
  imports: [PrismaModule],
  controllers: [TweetsController],
  providers: [TweetsService],
})
export class TweetsModule {}
