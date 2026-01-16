import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PasswordService } from './password.service';
import { PayloadDto } from '../../dto/payload.dto';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
  argon2id: 'argon2id',
}));

describe('PasswordService', () => {
  let service: PasswordService;
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(PasswordService);

    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password and return the hash', async () => {
      const corrId = 1;
      const password = 'secret';
      const fakeHash = '$argon2id$hash';

      (argon2.hash as jest.Mock).mockResolvedValue(fakeHash);

      const result = await service.hashPassword(corrId, password);

      expect(result).toBe(fakeHash);
      expect(argon2.hash).toHaveBeenCalledWith(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password is valid', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword(1, 'hash', 'password');

      expect(result).toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith('hash', 'password');
    });

    it('should return false when password is invalid', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword(2, 'hash', 'password');

      expect(result).toBe(false);
    });

    it('should return false when argon2 throws', async () => {
      (argon2.verify as jest.Mock).mockRejectedValue(new Error('invalid hash'));

      const result = await service.verifyPassword(3, 'broken', 'password');

      expect(result).toBe(false);
    });
  });

  describe('sign', () => {
    it('should sign payload and return access_token', async () => {
      const payload = { sub: 1 } as PayloadDto;
      const token = 'jwt.token';

      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.sign(1, payload);

      expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ access_token: token });
    });

    it('should throw if jwtService.signAsync fails', async () => {
      const payload = { sub: 1 } as PayloadDto;

      jwtService.signAsync.mockRejectedValue(new Error('sign failed'));

      await expect(service.sign(1, payload)).rejects.toThrow('sign failed');
    });
  });
});
