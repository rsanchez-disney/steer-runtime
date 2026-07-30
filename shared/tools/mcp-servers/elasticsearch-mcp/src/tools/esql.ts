import { getClient, Environment } from '../utils/client.js';

export const schema = {
  name: 'esql',
  description: 'Execute an ES|QL query. Returns results as an array of objects (converted from columnar format).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      environment: {
        type: 'string',
        enum: ['latest', 'stage', 'prod'],
        description: 'Target environment (default: latest)',
        default: 'latest'
      },
      query: {
        type: 'string',
        description: 'ES|QL query string (e.g. "FROM wdw_entities_en-us | STATS count = COUNT(*) BY type | SORT count DESC | LIMIT 20")'
      }
    },
    required: ['query']
  }
};

export async function handler(args: { environment?: string; query: string }) {
  const client = getClient((args.environment || 'latest') as Environment);
  const response = await client.esql.query({
    query: args.query,
    format: 'json'
  });

  // Convert columnar response to array of objects for readability
  const columns = (response as any).columns as Array<{ name: string; type: string }>;
  const values = (response as any).values as unknown[][];

  let result: unknown;
  if (columns && values) {
    const rows = values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col.name, row[i]]))
    );
    result = { columns: columns.map(c => `${c.name} (${c.type})`), rows, total: rows.length };
  } else {
    result = response;
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
  };
}
