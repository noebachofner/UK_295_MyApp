import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { TokenInfoDto } from '../../src/modules/auth/dto/token-info.dto';
import { NotFoundException } from '@nestjs/common';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';

describe('E2E - Auth', () => {
  let ctx: Awaited<ReturnType<typeof createE2EApp>>;
  let api: ReturnType<typeof supertest>;

  beforeAll(async () => {
    ctx = await createE2EApp();
    api = supertest(ctx.httpServer);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);

    await Promise.all([ctx.app.get(UserSeedService).seed()]);
  });

  afterAll(async () => {
    await ctx?.app?.close();
  });

  it('1) sign-in (wrong username) -> expect 404', async () => {
    const res = await api
      .post('/auth/login')
      .send({ username: 'johndode1', password: 'P@fsdfafasfasf' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: 'Not Found',
      statusCode: 404,
    });
    expect((res.body as NotFoundException).message).toBe(
      'User johndode1 not found',
    );
  });

  it('2) sign-in admin -> expect 201 + token', async () => {
    const res = await api
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    expect(res.status).toBe(201);
    expect((res.body as TokenInfoDto).access_token).toBeTruthy();
  });

  it('3) sign-in user -> expect 201 + token', async () => {
    const res = await api
      .post('/auth/login')
      .send({ username: 'user', password: 'user' });

    expect(res.status).toBe(201);
    expect((res.body as TokenInfoDto).access_token).toBeTruthy();
  });
});
