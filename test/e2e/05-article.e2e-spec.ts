import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { TokenInfoDto } from '../../src/modules/auth/dto/token-info.dto';
import { ReturnArticleDto } from '../../src/modules/article/dto/return-article.dto';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';
import { ArticleSeedService } from '../../src/modules/article/seed/article-seed.service';

describe('E2E - Article', () => {
  let ctx: Awaited<ReturnType<typeof createE2EApp>>;
  let api: ReturnType<typeof supertest>;

  beforeAll(async () => {
    ctx = await createE2EApp();
    api = supertest(ctx.httpServer);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);

    await Promise.all([
      ctx.app.get(UserSeedService).seed(),
      ctx.app.get(ArticleSeedService).seed(),
    ]);
  });

  afterAll(async () => {
    await ctx?.app?.close();
  });

  it('article CRUD flow', async () => {
    const login = await api
      .post('/auth/login')
      .send({ username: 'user', password: 'user' });

    const token = (login.body as TokenInfoDto).access_token;
    expect(token).toBeTruthy();

    const list1 = await api
      .get('/article')
      .set('Authorization', `Bearer ${token}`);

    expect(list1.status).toBe(200);
    expect(Array.isArray(list1.body)).toBe(true);
    const baseCount = (list1.body as ReturnArticleDto[]).length;

    const create = await api
      .post('/article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        articleName: 'Apple',
        articleDescription: 'Apple is a fruit',
        articlePrice: 10,
      });

    expect(create.status).toBe(201);
    const articleId = (create.body as ReturnArticleDto).id;

    const getOne = await api
      .get(`/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getOne.status).toBe(200);

    const list2 = await api
      .get('/article')
      .set('Authorization', `Bearer ${token}`);
    expect((list2.body as ReturnArticleDto[]).length).toBe(baseCount + 1);

    const patchBody = {
      articleName: 'Apple updated',
      articleDescription: 'Apple is a fruit updated',
      articlePrice: 100,
    };

    const patch = await api
      .patch(`/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(patchBody);

    expect(patch.status).toBe(200);
    expect((patch.body as ReturnArticleDto).articleName).toBe(
      patchBody.articleName,
    );

    const putInvalidId = await api
      .put(`/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: -1,
        articleName: 'x',
        articleDescription: 'y',
        articlePrice: 200,
        version: 1,
      });
    expect(putInvalidId.status).toBe(409);

    const del = await api
      .delete(`/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(patchBody);
    expect(del.status).toBe(200);

    const list3 = await api
      .get('/article')
      .set('Authorization', `Bearer ${token}`);
    expect((list3.body as ReturnArticleDto[]).length).toBe(baseCount);

    const del404 = await api
      .delete(`/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del404.status).toBe(404);
  });
});
