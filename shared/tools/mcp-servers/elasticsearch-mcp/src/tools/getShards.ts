import { getClient, Environment } from '../utils/client.js';

export const schema = {
  name: 'get_shards',
  description: 'Get shard allocation information. Shows shard distribution across nodes, state, and document counts.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      environment: {
        type: 'string',
        enum: ['latest', 'stage', 'prod'],
        description: 'Target environment (default: latest)',
        default: 'latest'
      },
      index: {
        type: 'string',
        description: 'Optional index name to filter shards (omit for all indices)'
      }
    }
  }
};

export async function handler(args: { environment?: string; index?: string }) {
  const client = getClient((args.environment || 'latest') as Environment);
  const response = await client.cat.shards({
    ...(args.index && { index: args.index }),
    format: 'json',
    h: 'index,shard,prirep,state,docs,store,node',
    s: 'index:asc,shard:asc'
  });
  return {
    content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
  };
}
