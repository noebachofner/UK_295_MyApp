import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { PasswordService } from './services/password.service';
import { UserController } from './controller/user.controller';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UserSeedService } from './seed/user-seed.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is missing');
        }
        return {
          global: true,
          secret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [AuthGuard, PasswordService, UserService, UserSeedService],
  exports: [AuthGuard, JwtModule, PasswordService, UserService],
})
export class UserModule {}
