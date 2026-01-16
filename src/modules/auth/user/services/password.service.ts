import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PayloadDto } from '../../dto/payload.dto';
import { TokenInfoDto } from '../../dto/token-info.dto';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(corrId: number, password: string): Promise<string> {
    this.logger.verbose(
      `${corrId} ${this.hashPassword.name} password: ${password}`,
    );
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,

      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    this.logger.verbose(`${corrId} ${this.hashPassword.name} hash: ${hash}`);
    return hash;
  }

  async verifyPassword(
    corrId: number,
    hash: string,
    password: string,
  ): Promise<boolean> {
    try {
      const ret = await argon2.verify(hash, password);
      this.logger.verbose(
        `${corrId} ${this.verifyPassword.name} verified: ${ret}`,
      );
      return ret;
    } catch {
      this.logger.warn(`${corrId} ${this.verifyPassword.name} invalid hash`);
      return false;
    }
  }

  async sign(corrId: number, payload: PayloadDto): Promise<TokenInfoDto> {
    const access_token = await this.jwtService.signAsync(payload);
    this.logger.verbose(
      `${corrId} ${this.sign.name} access_token: ${access_token}`,
    );
    return { access_token } as TokenInfoDto;
  }
}
