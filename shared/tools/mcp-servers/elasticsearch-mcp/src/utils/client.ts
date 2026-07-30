import { Client } from '@elastic/elasticsearch';

export type Environment = 'latest' | 'stage' | 'prod';

const clients: Partial<Record<Environment, Client>> = {};

const ENV_MAP: Record<Environment, { urlVar: string; keyVar: string }> = {
  latest: { urlVar: 'ES_URL_LATEST', keyVar: 'ES_LATEST_API_KEY' },
  stage: { urlVar: 'ES_URL_STAGE', keyVar: 'ES_STAGE_API_KEY' },
  prod: { urlVar: 'ES_URL_PROD', keyVar: 'ES_PROD_API_KEY' },
};

export function getClient(environment: Environment = 'latest'): Client {
  if (clients[environment]) return clients[environment]!;

  const { urlVar, keyVar } = ENV_MAP[environment];
  const node = process.env[urlVar];
  const apiKey = process.env[keyVar];

  if (!apiKey) {
    throw new Error(`Missing required environment variable: ${keyVar}`);
  }
  if (!node) {
    throw new Error(`Missing environment variable: ${urlVar}`);
  }

  const client = new Client({
    node,
    auth: { apiKey },
    tls: { rejectUnauthorized: true }
  });

  clients[environment] = client;
  return client;
}
