import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { ArticleModule } from '../../src/modules/article/article.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,

      load: [
        () => ({
          PORT: 3333,
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '3600s',
        }),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    AuthModule,
    ArticleModule,
  ],
})
export class TestAppModule {}
