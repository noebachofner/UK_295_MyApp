import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TestAppModule } from './test-app.module';
import { Server } from 'http';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';
import { ArticleSeedService } from '../../src/modules/article/seed/article-seed.service';

export type E2EContext = {
  app: INestApplication;
  httpServer: Server;
  dataSource: DataSource;
};

export async function createE2EApp(): Promise<E2EContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  Logger.overrideLogger(false);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  await Promise.all([
    app.get(UserSeedService).seed(),
    app.get(ArticleSeedService).seed(),
  ]);

  return {
    app,
    httpServer: app.getHttpServer() as Server,
    dataSource: app.get(DataSource),
  };
}
