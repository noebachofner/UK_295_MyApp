import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ReturnArticleDto } from '../dto/return-article.dto';
import { ReplaceArticleDto } from '../dto/replace-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repo: Repository<ArticleEntity>,
  ) {}
  private entityToDto(entity: ArticleEntity): ReturnArticleDto {
    return {
      id: entity.id,
      articleName: entity.articleName,
      articleDescription: entity.articleDescription,
      articlePrice: entity.articlePrice,
      createdAt: entity.createdAt,
      createdById: entity.createdById,
      updatedAt: entity.updatedAt,
      updatedById: entity.updatedById,
      version: entity.version,
    } as ReturnArticleDto;
  }
  async create(
    userId: number,
    createDto: CreateArticleDto,
  ): Promise<ReturnArticleDto> {
    const createEntity = this.repo.create(createDto);
    createEntity.createdById = userId;
    createEntity.updatedById = userId;
    const savedEntity = await this.repo.save(createEntity);
    return this.entityToDto(savedEntity);
  }
  async findAll(): Promise<ReturnArticleDto[]> {
    const arr = await this.repo.find();

    return arr.map((e) => this.entityToDto(e));
  }
  async findOne(id: number): Promise<ReturnArticleDto> {
    const findEntity = await this.repo.findOneBy({ id });
    if (!findEntity) throw new NotFoundException(`Article ${id} not found`);
    return this.entityToDto(findEntity);
  }
  async replace(
    userId: number,
    id: number,
    replaceDto: ReplaceArticleDto,
  ): Promise<ReturnArticleDto> {
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) throw new NotFoundException(`Article ${id} not found`);

    if (existingEntity.version !== replaceDto.version) {
      throw new ConflictException(
        `Article ${id} version mismatch. Expected ${existingEntity.id} got ${replaceDto.version}`,
      );
    }
    if (existingEntity.id !== replaceDto.id) {
      throw new ConflictException(
        `Article id mismatch. Expected ${existingEntity.id} got ${replaceDto.id}`,
      );
    }
    const replacedEntity = await this.repo.save({
      ...existingEntity,
      ...replaceDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(replacedEntity);
  }
  async update(
    userId: number,
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ReturnArticleDto> {
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) throw new NotFoundException(`Article ${id} not found`);
    const updatedEntity = await this.repo.save({
      ...existingEntity,
      ...updateArticleDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(updatedEntity);
  }
  async remove(id: number): Promise<ReturnArticleDto> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Article ${id} not found`);
    await this.repo.remove(existing);
    return this.entityToDto(existing);
  }
}
