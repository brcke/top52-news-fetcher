import { Pool } from 'pg';
import { safeLoad } from 'js-yaml';
import { join } from 'path';
import { readFileSync } from 'fs';

export class DatabaseManager {
  public pool: Pool

  constructor() {
    const path = join(__dirname, '../../config/database.yml');
    const config = safeLoad(readFileSync(path, 'utf8'));
    this.pool = new Pool({
      user: config.octo,
      database: config.database,
      password: config.password,
      host: config.host,
      port: config.port,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis
    });
  }

  public async query(query: string, parameters?: any[]): Promise<any> {
    let client = await this.pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      try {
        res = await client.query(query, parameters);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    } finally {
      client.release();
    }
    return res;
  }
}