// Simple guestbook API using Vercel's edge config or a JSON file approach
// Uses a global variable that persists within a single serverless instance
// For production, connect to Vercel KV or a database

const now = Date.now();
let entries = [
  { id: '2', text: "The moment he appeared on screen and she saw his face — that's when everyone lost it.", name: 'Guest', handle: '', ts: now - 86400000 },
  { id: '3', text: 'This is what happens when engineers have hearts.', name: 'Husam', handle: '@hus', ts: now - 3600000 * 6 },
  { id: '4', text: 'History. We were all part of history.', name: 'Guest', handle: '', ts: now - 3600000 * 2 },
];

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new Response(null, { status: 200, headers });
}

export function GET() {
  return Response.json(entries.slice().reverse(), { headers });
}

export async function POST(request) {
  const { text, name, handle } = await request.json();

  if (!text || !name) {
    return Response.json({ error: 'Text and name are required' }, { status: 400, headers });
  }

  if (text.length > 280) {
    return Response.json({ error: 'Message too long (max 280 chars)' }, { status: 400, headers });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.slice(0, 280),
    name: name.slice(0, 50),
    handle: (handle || '').slice(0, 50),
    ts: Date.now(),
  };

  entries.push(entry);

  if (entries.length > 200) {
    entries = entries.slice(-200);
  }

  return Response.json(entry, { status: 201, headers });
}
