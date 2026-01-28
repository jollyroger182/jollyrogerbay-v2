import { sql } from 'bun'

await Bun.sql`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  );
`

interface KVPair {
  key: string
  value: string
}

export const KV = {
  async get<T>(key: string): Promise<T | null> {
    const [pair] = await sql<KVPair[]>`SELECT * FROM kv WHERE key = ${key}`
    if (!pair) return null
    return JSON.parse(pair.value)
  },

  async set(key: string, value: any) {
    const ser = JSON.stringify(value)
    const payload = { key, value: ser }
    await sql`INSERT INTO kv ${sql(payload)} ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
  },

  async delete(key: string) {
    await sql`DELETE FROM kv WHERE key = ${key}`
  }
}
