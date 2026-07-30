import { getClient, Environment } from '../utils/client.js';

export const schema = {
  name: 'search',
  description: 'Execute an Elasticsearch search query using Query DSL. Returns matching documents with total hit count.',
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
        description: 'Index name to search (e.g. "wdw_entities_en-us", "boost_block_a")'
      },
      query_body: {
        type: 'object',
        description: 'Elasticsearch Query DSL body (e.g. { "query": { "match": { "title": "splash" } }, "size": 10 })'
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional list of fields to return in _source (source filtering)'
      }
    },
    required: ['index', 'query_body']
  }
};

export async function handler(args: { environment?: string; index: string; query_body: Record<string, unknown>; fields?: string[] }) {
  const client = getClient((args.environment || 'latest') as Environment);
  const response = await client.search({
    index: args.index,
    ...args.query_body,
    ...(args.fields && { _source: args.fields })
  });

  const total = typeof response.hits.total === 'number'
    ? response.hits.total
    : response.hits.total?.value ?? 0;

  const result = {
    total,
    hits: response.hits.hits.map(hit => ({
      _index: hit._index,
      _id: hit._id,
      _score: hit._score,
      _source: hit._source
    })),
    ...(response.aggregations && { aggregations: response.aggregations })
  };

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
  };
}
