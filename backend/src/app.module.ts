import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TweetsModule } from './tweets/tweets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, TweetsModule, UsersModule],
})
export class AppModule {}
