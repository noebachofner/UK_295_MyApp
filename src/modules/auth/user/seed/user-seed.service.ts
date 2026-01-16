import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from '../services/password.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeedService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const userRepo = this.dataSource.getRepository(UserEntity);
    this.logger.debug(`${this.seed.name}: start`);

    await this.upsertById(userRepo, 1, 'admin', true);
    await this.upsertById(userRepo, 2, 'user', false);
  }

  private async upsertById(
    userRepo: Repository<UserEntity>,
    id: number,
    username: string,
    isAdmin: boolean,
    password: string = username,
  ) {
    this.logger.verbose(
      `${this.upsertById.name}: id=${id}, username=${username}, isAdmin=${isAdmin}, password=${password}`,
    );
    const existing = await userRepo.findOneBy({ id });
    if (existing) return;

    await userRepo.upsert(
      {
        id,
        username: username.toLowerCase(),
        email: `${username}@local.ch`.toLowerCase(),
        isAdmin: isAdmin,
        passwordHash: await this.passwordService.hashPassword(0, password),
        createdById: 0,
        updatedById: 0,
      },
      ['id'],
    );
  }
}
