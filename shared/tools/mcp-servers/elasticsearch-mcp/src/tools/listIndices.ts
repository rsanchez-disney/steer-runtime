import { getClient, Environment } from '../utils/client.js';

export const schema = {
  name: 'list_indices',
  description: 'List Elasticsearch indices matching a pattern. Returns index name, health, status, document count, and store size.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      environment: {
        type: 'string',
        enum: ['latest', 'stage', 'prod'],
        description: 'Target environment (default: latest)',
        default: 'latest'
      },
      index_pattern: {
        type: 'string',
        description: 'Index pattern to match (e.g. "*", "wdw_*", "boost_block*")'
      }
    },
    required: ['index_pattern']
  }
};

export async function handler(args: { environment?: string; index_pattern: string }) {
  const client = getClient((args.environment || 'latest') as Environment);
  const response = await client.cat.indices({
    index: args.index_pattern,
    format: 'json',
    h: 'index,health,status,docs.count,store.size,pri,rep',
    s: 'index:asc'
  });
  return {
    content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
  };
}
