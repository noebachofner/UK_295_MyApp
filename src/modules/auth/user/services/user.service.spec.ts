import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PasswordService } from './password.service';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, ReturnUserDto, UpdateUserAdminDto } from '../dto';
import { SignInDto } from '../../dto/sign-in.dto';
import { TokenInfoDto } from '../../dto/token-info.dto';

type RepoMock = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
  remove: jest.Mock;
};

type PasswordServiceMock = jest.Mocked<
  Pick<PasswordService, 'hashPassword' | 'verifyPassword' | 'sign'>
>;

describe('UserService', () => {
  let service: UserService;
  let repo: RepoMock;
  let passwordService: PasswordServiceMock;

  const corrId = 1;
  const createUserDto = {
    username: 'test',
    email: 'test@example.com',
    password: 'password',
    isAdmin: false,
  } as CreateUserDto;

  const userEntity = {
    id: 1,
    username: 'test',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    isAdmin: false,
    version: 0,
    createdById: 0,
    updatedById: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserEntity;

  const returnUserDto = {
    ...userEntity,
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: repo,
        },
        {
          provide: PasswordService,
          useValue: passwordService as unknown as PasswordService,
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException when password is invalid', async () => {
      repo.findOneBy.mockResolvedValue({
        id: 10,
        username: 'test',
        passwordHash: 'hash',
        email: 'x',
        isAdmin: false,
      } as UserEntity);

      passwordService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.signIn(corrId, {
          username: 'test',
          password: 'wrong',
        } as SignInDto),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        corrId,
        'hash',
        'wrong',
      );
      expect(passwordService.sign).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is no found', async () => {
      repo.findOneBy.mockResolvedValue(undefined);

      await expect(
        service.signIn(corrId, {
          username: 'unknown',
          password: 'unknown',
        } as SignInDto),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(passwordService.sign).not.toHaveBeenCalled();
    });

    it('should return token when password is valid', async () => {
      repo.findOneBy.mockResolvedValue({
        id: 10,
        username: 'test',
        passwordHash: 'hash',
        email: 'x',
        isAdmin: false,
      } as UserEntity);

      passwordService.verifyPassword.mockResolvedValue(true);
      passwordService.sign.mockResolvedValue({
        access_token: 'jwt.token',
      } as TokenInfoDto);

      const result = await service.signIn(corrId, {
        username: 'test',
        password: 'correct',
      } as SignInDto);

      expect(passwordService.sign).toHaveBeenCalledWith(corrId, {
        sub: 10,
        username: 'test',
      });
      expect(result).toEqual({ access_token: 'jwt.token' });
    });
  });

  describe('create', () => {
    it('should create a user when username does not exist', async () => {
      repo.create.mockReturnValue(userEntity);
      repo.findOneBy.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('HASHED');
      repo.save.mockResolvedValue(userEntity);

      const result = await service.create(corrId, 0, createUserDto);

      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        username: createUserDto.username,
      });
      const hashSpy = jest.spyOn(passwordService, 'hashPassword');
      expect(hashSpy).toHaveBeenCalledWith(1, createUserDto.password);
      expect(repo.save).toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        username: createUserDto.username,
        email: createUserDto.email,
        isAdmin: false,
      });
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException when username already exists', async () => {
      repo.create.mockReturnValue({} as UserEntity);
      repo.findOneBy.mockResolvedValue({ id: 1 } as UserEntity);

      await expect(
        service.create(1, 0, {
          username: 'user1',
          email: 'x',
          password: 'pw',
        } as CreateUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users mapped to ReturnUserDto', async () => {
      repo.find.mockResolvedValue([
        {
          ...userEntity,
          username: 'u1',
          id: 1,
          isAdmin: true,
          passwordHash: 'H1',
        },
        {
          ...userEntity,
          username: 'u2',
          id: 2,
          isAdmin: false,
          passwordHash: 'H2',
        },
      ] as UserEntity[]);

      const result = await service.findAll(1);

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, username: 'u1', email: 'test@example.com', isAdmin: true },
        { id: 2, username: 'u2', email: 'test@example.com', isAdmin: false },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return one user mapped to ReturnUserDto', async () => {
      repo.findOneBy.mockResolvedValue({
        id: 5,
        username: 'u5',
        email: 'u5@local',
        isAdmin: false,
        passwordHash: 'H',
      } as UserEntity);

      const result = await service.findOne(1, 5);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 5 });
      expect(result).toEqual({
        id: 5,
        username: 'u5',
        email: 'u5@local',
        isAdmin: false,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('replace', () => {
    it('should replace user fields and return ReturnUserDto', async () => {
      const existing = {
        id: 1,
        username: 'old',
        email: 'old@local',
        isAdmin: false,
        passwordHash: 'H',
      } as UserEntity;

      repo.findOneBy.mockResolvedValue(existing);
      repo.save.mockResolvedValue({
        ...existing,
        username: 'new',
        email: 'new@local',
        isAdmin: true,
      } as UserEntity);

      const result = await service.replace(1, 0, 1, {
        id: 1,
        username: 'new',
        email: 'new@local',
        isAdmin: true,
      } as ReturnUserDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        username: 'new',
        email: 'new@local',
        isAdmin: true,
      });
    });

    it('should throw ConflictException if the version is to old', async () => {
      repo.findOneBy.mockResolvedValue({ ...userEntity, version: 3 });

      await expect(service.replace(1, 0, 1, returnUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.replace(1, 0, 1, {} as ReturnUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user fields and return ReturnUserDto', async () => {
      const existing = {
        id: 2,
        username: 'u2',
        email: 'u2@local',
        isAdmin: false,
        passwordHash: 'H',
      } as UserEntity;

      repo.findOneBy.mockResolvedValue(existing);
      repo.save.mockResolvedValue({
        ...existing,
        isAdmin: true,
      } as UserEntity);

      const result = await service.update(1, 0, 2, {
        isAdmin: true,
      } as UpdateUserAdminDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 2,
        username: 'u2',
        email: 'u2@local',
        isAdmin: true,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(1, 0, 999, { isAdmin: true } as UpdateUserAdminDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove user and return ReturnUserDto', async () => {
      const existing = {
        id: 7,
        username: 'u7',
        email: 'u7@local',
        isAdmin: false,
        passwordHash: 'H',
      } as UserEntity;

      repo.findOneBy.mockResolvedValue(existing);
      repo.remove.mockResolvedValue(existing);

      const result = await service.remove(1, 7);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 7 });
      expect(repo.remove).toHaveBeenCalledWith(existing);
      expect(result).toEqual({
        id: 7,
        username: 'u7',
        email: 'u7@local',
        isAdmin: false,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1, 123)).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
