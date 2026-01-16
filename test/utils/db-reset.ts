import { DataSource } from 'typeorm';

export async function resetDatabase(ds: DataSource) {
  await ds.synchronize(true);
}
