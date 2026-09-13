import { serverEnv } from '#/lib/env.server.ts'
import { Client as TypesenseClient } from 'typesense'

let client: TypesenseClient | undefined

export function getTypesenseClient(): TypesenseClient {
  if (!client) {
    client = new TypesenseClient({
      nodes: [
        {
          host: serverEnv.TYPESENSE_HOST,
          port: serverEnv.TYPESENSE_PORT,
          protocol: serverEnv.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: serverEnv.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 5,
    })
  }

  return client
}
