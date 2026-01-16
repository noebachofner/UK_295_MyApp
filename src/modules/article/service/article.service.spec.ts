import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ArticleService } from './article.service';
import { ArticleEntity } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ReturnArticleDto } from '../dto/return-article.dto';

type RepoMock = jest.Mocked<
  Pick<
    Repository<ArticleEntity>,
    'create' | 'save' | 'find' | 'findOneBy' | 'remove'
  >
>;

describe('ArticleService', () => {
  let service: ArticleService;
  let repo: RepoMock;

  const baseEntity = (overrides: Partial<ArticleEntity> = {}): ArticleEntity =>
    ({
      id: 1,
      articleName: 'A',
      articleDescription: 'Desc',
      articlePrice: 9.99,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      createdById: 10,
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      updatedById: 10,
      version: 3,
      ...overrides,
    }) as ArticleEntity;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: getRepositoryToken(ArticleEntity), useValue: repo },
      ],
    }).compile();

    service = module.get(ArticleService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create, set createdById/updatedById, save and return dto', async () => {
      const userId = 7;
      const dto = {
        articleName: 'New',
        articleDescription: 'NewDesc',
        articlePrice: 12.5,
      } as CreateArticleDto;

      const created = baseEntity({
        id: 1,
        version: 1,
        createdById: 1,
        updatedById: 1,
        articleName: dto.articleName,
        articleDescription: dto.articleDescription,
        articlePrice: dto.articlePrice,
      });

      const saved = baseEntity({
        id: 42,
        version: 1,
        createdById: userId,
        updatedById: userId,
        articleName: dto.articleName,
        articleDescription: dto.articleDescription,
        articlePrice: dto.articlePrice,
      });

      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(userId, dto);

      expect(repo.create).toHaveBeenCalledWith(dto);

      expect(created.createdById).toBe(userId);
      expect(created.updatedById).toBe(userId);

      expect(repo.save).toHaveBeenCalledWith(created);

      expect(result).toEqual({
        id: 42,
        articleName: dto.articleName,
        articleDescription: dto.articleDescription,
        articlePrice: dto.articlePrice,
        createdAt: saved.createdAt,
        createdById: userId,
        updatedAt: saved.updatedAt,
        updatedById: userId,
        version: 1,
      });
    });
  });

  describe('findAll', () => {
    it('should return mapped dtos', async () => {
      const e1 = baseEntity({ id: 1, articleName: 'A1' });
      const e2 = baseEntity({ id: 2, articleName: 'A2' });

      repo.find.mockResolvedValue([e1, e2]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual([
        expect.objectContaining({ id: 1, articleName: 'A1' }),
        expect.objectContaining({ id: 2, articleName: 'A2' }),
      ]);
    });

    it('should return empty array when repo returns empty', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      repo.findOneBy.mockResolvedValue(null as unknown as ArticleEntity);

      await expect(service.findOne(123)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(service.findOne(123)).rejects.toThrow(
        'Article 123 not found',
      );

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 123 });
    });

    it('should return dto when found', async () => {
      const entity = baseEntity({ id: 5, articleName: 'X' });
      repo.findOneBy.mockResolvedValue(entity);

      const result = await service.findOne(5);

      expect(result).toEqual(
        expect.objectContaining({
          id: 5,
          articleName: 'X',
          articleDescription: entity.articleDescription,
          articlePrice: entity.articlePrice,
          createdAt: entity.createdAt,
          createdById: entity.createdById,
          updatedAt: entity.updatedAt,
          updatedById: entity.updatedById,
          version: entity.version,
        }),
      );
    });
  });

  describe('replace', () => {
    it('should throw NotFoundException when not found', async () => {
      repo.findOneBy.mockResolvedValue(undefined as unknown as ArticleEntity);

      await expect(
        service.replace(7, 1, { id: 1 } as ReturnArticleDto),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw ConflictException on version mismatch', async () => {
      const existing = baseEntity({ id: 1, version: 2 });
      repo.findOneBy.mockResolvedValue(existing);

      const incoming: ReturnArticleDto = {
        id: 2,
        version: 2,
      } as ReturnArticleDto;

      await expect(service.replace(7, 1, incoming)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.replace(7, 3, incoming)).rejects.toThrow(
        'Article id mismatch. Expected 1 got 2',
      );

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on id mismatch', async () => {
      const existing = baseEntity({ id: 1, version: 1 });
      repo.findOneBy.mockResolvedValue(existing);

      const incoming: ReturnArticleDto = {
        id: 1,
        version: 2,
      } as ReturnArticleDto;

      await expect(service.replace(7, 3, incoming)).rejects.toBeInstanceOf(
        ConflictException,
      );
      await expect(service.replace(7, 3, incoming)).rejects.toThrow(
        'Article 3 version mismatch. Expected 1 got 2',
      );

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should save merged entity and return dto when version matches', async () => {
      const userId = 99;
      const id = 10;

      const existing = baseEntity({ id, version: 5, articleName: 'Old' });
      repo.findOneBy.mockResolvedValue(existing);

      const incoming: ReturnArticleDto = {
        id,
        version: 5,
        articleName: 'NewName',
        articleDescription: 'NewDesc',
        articlePrice: 100,
        createdAt: existing.createdAt,
        createdById: existing.createdById,
        updatedAt: existing.updatedAt,
        updatedById: existing.updatedById,
      } as ReturnArticleDto;

      const saved = baseEntity({
        id,
        version: 5,
        articleName: 'NewName',
        articleDescription: 'NewDesc',
        articlePrice: 100,
        updatedById: userId,
      });

      repo.save.mockResolvedValue(saved);

      const result = await service.replace(userId, id, incoming);

      expect(repo.save).toHaveBeenCalledWith({
        ...existing,
        ...incoming,
        updatedById: userId,
        id,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id,
          articleName: 'NewName',
          articleDescription: 'NewDesc',
          articlePrice: 100,
          updatedById: userId,
          version: 5,
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      repo.findOneBy.mockResolvedValue(null as unknown as ArticleEntity);

      await expect(
        service.update(7, 1, { articleName: 'X' } as UpdateArticleDto),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should save merged entity and return dto', async () => {
      const userId = 8;
      const id = 2;

      const existing = baseEntity({ id, articleName: 'A' });
      repo.findOneBy.mockResolvedValue(existing);

      const patch: UpdateArticleDto = {
        articleName: 'B',
      } as UpdateArticleDto;

      const saved = baseEntity({ id, articleName: 'B', updatedById: userId });
      repo.save.mockResolvedValue(saved);

      const result = await service.update(userId, id, patch);

      expect(repo.save).toHaveBeenCalledWith({
        ...existing,
        ...patch,
        updatedById: userId,
        id,
      });

      expect(result).toEqual(expect.objectContaining({ id, articleName: 'B' }));
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      repo.findOneBy.mockResolvedValue(undefined as unknown as ArticleEntity);

      await expect(service.remove(55)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('should remove entity and return dto of removed entity', async () => {
      const existing = baseEntity({ id: 9, articleName: 'Del' });
      repo.findOneBy.mockResolvedValue(existing);
      repo.remove.mockResolvedValue(existing);

      const result = await service.remove(9);

      expect(repo.remove).toHaveBeenCalledWith(existing);
      expect(result).toEqual(
        expect.objectContaining({ id: 9, articleName: 'Del' }),
      );
    });
  });
});
