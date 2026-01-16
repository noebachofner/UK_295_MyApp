import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  exports: [UserModule],
})
export class AuthModule {}
