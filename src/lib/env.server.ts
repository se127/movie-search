import z from 'zod'

export const serverEnv = z
  .object({
    DATABASE_URL: z.url(),
    TYPESENSE_API_KEY: z.string().trim().min(1),
    TYPESENSE_HOST: z.string().trim().min(1),
    TYPESENSE_PORT: z.coerce.number().int().positive(),
    TYPESENSE_PROTOCOL: z.enum(['http', 'https']),
  })
  .parse(process.env)
