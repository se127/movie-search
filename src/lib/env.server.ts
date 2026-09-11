import z from 'zod'

export const serverEnv = z
  .object({
    THEMOVIEDB_READ_ACCESS_TOKEN: z.string().trim().min(1),
  })
  .parse(process.env)
