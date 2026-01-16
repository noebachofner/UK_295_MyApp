import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, ReturnUserDto, UpdateUserAdminDto } from '../dto';
import { PasswordService } from './password.service';
import { SignInDto } from '../../dto/sign-in.dto';
import { TokenInfoDto } from '../../dto/token-info.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  private async findOneEntityByUsername(corrId: number, username: string) {
    this.logger.verbose(
      `${corrId} ${this.findOneEntityByUsername.name} username: ${username}`,
    );
    const findEntity = await this.repo.findOneBy({ username });
    if (!findEntity) {
      this.logger.debug(
        `${corrId} ${this.findOneEntityByUsername.name} not found`,
      );
      throw new NotFoundException(`User ${username} not found`);
    }
    this.logger.verbose(
      `${corrId} ${this.findOneEntityByUsername.name} found: ${JSON.stringify(findEntity, null, 2)}`,
    );
    return findEntity;
  }

  async signIn(corrId: number, signInDto: SignInDto): Promise<TokenInfoDto> {
    const user = await this.findOneEntityByUsername(corrId, signInDto.username);
    if (
      !(await this.passwordService.verifyPassword(
        corrId,
        user.passwordHash,
        signInDto.password,
      ))
    ) {
      throw new UnauthorizedException();
    }
    return this.passwordService.sign(corrId, {
      sub: user.id,
      username: user.username,
    });
  }

  private entityToDto(corrId: number, entity: UserEntity): ReturnUserDto {
    this.logger.verbose(
      `${corrId} ${this.entityToDto.name} entity: ${JSON.stringify(entity, null, 2)}`,
    );

    const dto = {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      isAdmin: entity.isAdmin,
    } as ReturnUserDto;
    this.logger.verbose(
      `${corrId} ${this.entityToDto.name} dto: ${JSON.stringify(dto, null, 2)}`,
    );
    return dto;
  }

  async create(corrId: number, userId: number, createDto: CreateUserDto) {
    this.logger.debug(
      `${corrId} ${this.create.name} createDto: ${JSON.stringify(createDto, null, 2)}`,
    );
    const createEntity = this.repo.create(createDto);

    const existing = await this.repo.findOneBy({
      username: createDto.username,
    });
    if (existing) {
      this.logger.warn(
        `${corrId} ${this.create.name} username already exists: ${createDto.username}`,
      );
      throw new ConflictException(
        `Username ${createDto.username} already exists`,
      );
    }

    createEntity.passwordHash = await this.passwordService.hashPassword(
      corrId,
      createDto.password,
    );
    createEntity.createdById = userId;
    createEntity.updatedById = userId;
    const savedEntity = await this.repo.save(createEntity);
    return this.entityToDto(corrId, savedEntity);
  }

  async findAll(corrId: number) {
    Logger.verbose(`${corrId} ${this.findAll.name}`, UserService.name);

    const arr = await this.repo.find();

    return arr.map((e) => this.entityToDto(corrId, e));
  }

  async findOne(corrId: number, id: number) {
    this.logger.verbose(`${corrId} ${this.findOne.name} id: ${id}`);
    const findEntity = await this.repo.findOneBy({ id });
    if (!findEntity) {
      this.logger.debug(`${corrId} ${this.findOne.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.entityToDto(corrId, findEntity);
  }

  async replace(
    corrId: number,
    userId: number,
    id: number,
    returnDto: ReturnUserDto,
  ): Promise<ReturnUserDto> {
    this.logger.verbose(
      `${corrId} ${this.replace.name} id: ${id} returnDto: ${JSON.stringify(
        returnDto,
        null,
        2,
      )}`,
    );
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) {
      this.logger.debug(`${corrId} ${this.replace.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }

    if (existingEntity.version !== returnDto.version) {
      this.logger.debug(
        `${corrId} ${this.replace.name} id: ${id} version mismatch. Expected ${existingEntity.version} got ${returnDto.version}`,
      );
      throw new ConflictException(
        `User ${id} version mismatch, expected ${existingEntity.version} got ${returnDto.version}`,
      );
    }
    const replacedEntity = await this.repo.save({
      ...existingEntity,
      ...returnDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(corrId, replacedEntity);
  }

  async update(
    corrId: number,
    userId: number,
    id: number,
    updateUserAdminDto: UpdateUserAdminDto,
  ) {
    this.logger.verbose(
      `${corrId} ${this.update.name} id: ${id} updateUserAdminDto: ${JSON.stringify(
        updateUserAdminDto,
        null,
        2,
      )}`,
    );

    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) {
      this.logger.debug(`${corrId} ${this.update.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    const updatedEntity = await this.repo.save({
      ...existingEntity,
      ...updateUserAdminDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(corrId, updatedEntity);
  }

  async remove(corrId: number, id: number) {
    this.logger.verbose(`${corrId} ${this.remove.name} id: ${id}`);

    const existing = await this.repo.findOneBy({ id });
    if (!existing) {
      this.logger.debug(`${corrId} ${this.remove.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    const deleted = await this.repo.remove(existing);
    this.logger.verbose(
      `${corrId} ${this.remove.name} id: ${id} deleted: ${JSON.stringify(deleted, null, 2)}`,
    );
    return this.entityToDto(corrId, existing);
  }
}
