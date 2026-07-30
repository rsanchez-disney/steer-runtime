import { getClient, Environment } from '../utils/client.js';

export const schema = {
  name: 'get_mappings',
  description: 'Get field mappings for an Elasticsearch index. Shows field names, types, and analyzers.',
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
        description: 'Index name (e.g. "wdw_entities_en-us")'
      }
    },
    required: ['index']
  }
};

export async function handler(args: { environment?: string; index: string }) {
  const client = getClient((args.environment || 'latest') as Environment);
  const response = await client.indices.getMapping({ index: args.index });
  return {
    content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
  };
}
