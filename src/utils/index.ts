import type z from 'zod'

export function defineModule<T>(
  func: (config: T) => Promise<void>,
  schema: z.ZodType<T>,
) {
  return { func, schema }
}
