import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { ReturnUserDto } from '../../src/modules/auth/user/dto';
import { TokenInfoDto } from '../../src/modules/auth/dto/token-info.dto';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';

describe('E2E - User flow', () => {
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

  it('register -> duplicate -> login -> profile -> delete scenarios', async () => {
    const reg1 = await api.post('/auth/register').send({
      username: 'user1234',
      email: 'user1234@local.ch',
      password: 'user1234A$',
    });

    expect(reg1.status).toBe(201);
    const createdUserId = (reg1.body as ReturnUserDto).id;
    expect(createdUserId).toBeDefined();

    const reg2 = await api.post('/auth/register').send({
      username: 'user1234',
      email: 'user1234@local.ch',
      password: 'user1234A$',
    });

    expect(reg2.status).toBe(409);

    const loginCreated = await api
      .post('/auth/login')
      .send({ username: 'user1234', password: 'user1234A$' });

    expect(loginCreated.status).toBe(201);
    const createdToken = (loginCreated.body as TokenInfoDto).access_token;

    const prof = await api
      .get('/auth/profile')
      .set('Authorization', `Bearer ${createdToken}`);

    expect(prof.status).toBe(200);
    expect((prof.body as ReturnUserDto).username).toBe('user1234');

    const delUnauthorized = await api.delete(`/user/${createdUserId}`);
    expect(delUnauthorized.status).toBe(401);

    const loginUser = await api
      .post('/auth/login')
      .send({ username: 'user', password: 'user' });

    const delForbidden = await api
      .delete(`/user/${createdUserId}`)
      .set(
        'Authorization',
        `Bearer ${(loginUser.body as TokenInfoDto).access_token}`,
      );

    expect(delForbidden.status).toBe(403);

    const loginAdmin = await api
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const delOk = await api
      .delete(`/user/${createdUserId}`)
      .set(
        'Authorization',
        `Bearer ${(loginAdmin.body as TokenInfoDto).access_token}`,
      );

    expect(delOk.status).toBe(200);
    expect((delOk.body as ReturnUserDto).username).toBe('user1234');
  });
});
