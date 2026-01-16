import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';

@Injectable()
export class ArticleSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ArticleSeedService.name);
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const articleRepo = this.dataSource.getRepository(ArticleEntity);
    this.logger.debug(`${this.seed.name}: start`);
    await this.upsertById(
      articleRepo,
      1,
      'Sample Article',
      'Example of Article Description',
      10.5,
      1,
    );
  }

  private async upsertById(
    articleRepo: Repository<ArticleEntity>,
    id: number,
    articleName: string,
    articleDescription: string,
    articlePrice: number,
    userId: number,
  ) {
    this.logger.verbose(
      `${this.upsertById.name}: id=${id}, articleName=${articleName}, articleDescription=${articleDescription}, articlePrice=${articlePrice}`,
    );
    const existing = await articleRepo.findOneBy({ id });
    if (existing) return;
    await articleRepo.upsert(
      {
        id,
        articleName,
        articleDescription,
        articlePrice,
        createdById: userId,
        updatedById: userId,
      },
      { conflictPaths: ['id'] },
    );
  }
}
