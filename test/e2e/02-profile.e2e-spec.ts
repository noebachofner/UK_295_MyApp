import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { UnauthorizedException } from '@nestjs/common';
import { TokenInfoDto } from '../../src/modules/auth/dto/token-info.dto';
import { ReturnUserDto } from '../../src/modules/auth/user/dto';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';

describe('E2E - Profile', () => {
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

  it('1) profile (unauthorized) -> expect 401', async () => {
    const res = await api.get('/auth/profile');

    expect(res.status).toBe(401);
    expect((res.body as UnauthorizedException).message).toBe('Unauthorized');
  });

  it('2) profile admin -> expect 200', async () => {
    const login = await api
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const token = (login.body as TokenInfoDto).access_token;

    const res = await api
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect((res.body as ReturnUserDto).username).toBe('admin');
  });

  it('3) profile user -> expect 200', async () => {
    const login = await api
      .post('/auth/login')
      .send({ username: 'user', password: 'user' });

    const token = (login.body as TokenInfoDto).access_token;

    const res = await api
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect((res.body as ReturnUserDto).username).toBe('user');
  });
});
