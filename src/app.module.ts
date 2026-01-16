import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './modules/article/article.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      synchronize: true,
      type: 'sqlite',
      database: ':memory:',
    }),
    AuthModule,
    ArticleModule,
  ],
})
export class AppModule {}
