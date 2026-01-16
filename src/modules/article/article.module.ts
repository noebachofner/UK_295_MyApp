import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controller/article.controller';
import { ArticleEntity } from './entities/article.entity';
import { UserModule } from '../auth/user/user.module';
import { ArticleSeedService } from './seed/article-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), UserModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleSeedService],
})
export class ArticleModule {}
