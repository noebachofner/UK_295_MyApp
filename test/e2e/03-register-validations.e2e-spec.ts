import * as supertest from 'supertest';
import { createE2EApp } from '../utils/e2e-app';
import { resetDatabase } from '../utils/db-reset';
import { getValidationMessages } from '../utils/assertions';
import { UserSeedService } from '../../src/modules/auth/user/seed/user-seed.service';

describe('E2E - Register validations', () => {
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

  it('username too short -> 400', async () => {
    const res = await api.post('/auth/register').send({
      username: '1234567',
      email: 'test@test.ch',
      password: 'abcD1$234',
    });

    expect(res.status).toBe(400);
    const messages = getValidationMessages(res.body);
    expect(messages[0]).toContain('longer than or equal to 8');
  });

  it('email wrong -> 400', async () => {
    const res = await api.post('/auth/register').send({
      username: 'abcd1234',
      email: 'test',
      password: 'abcD123$',
    });

    expect(res.status).toBe(400);
    const messages = getValidationMessages(res.body);
    expect(messages[0]).toContain('email must be an email');
  });
});
