import z from 'zod'

export const serverEnv = z
  .object({
    DATABASE_URL: z.url(),
  })
  .parse(process.env)
