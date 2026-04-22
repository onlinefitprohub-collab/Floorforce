/**
 * HP Tickets Worker — Cloudflare Worker
 *
 * Proxies Trello API calls server-side so credentials are never exposed
 * in the browser. Fetches all cards from the configured "Open" list and
 * returns only the cards whose description contains the requesting user's
 * email address.
 *
 * Secrets (set via `wrangler secret put <NAME>`):
 *   TRELLO_KEY   — Trello API key  (from https://trello.com/app-key)
 *   TRELLO_TOKEN — Trello API token (from same page, click "Generate Token")
 *   LIST_ID      — Trello list ID for your "Open" tickets list
 *                  (find it: GET /1/boards/{BOARD_ID}/lists?key=K&token=T)
 *
 * Deploy:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler init hp-tickets-worker  (choose "Hello World" worker)
 *   # Replace the generated worker.js with this file
 *   wrangler secret put TRELLO_KEY
 *   wrangler secret put TRELLO_TOKEN
 *   wrangler secret put LIST_ID
 *   wrangler deploy
 *   # Your worker URL: https://hp-tickets-worker.<account>.workers.dev
 */

addEventListener('fetch', function (event) {
  event.respondWith(handle(event.request));
});

async function handle(req) {
  var cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, cors);
  }

  var email = new URL(req.url).searchParams.get('email');
  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Valid email param required' }, 400, cors);
  }

  // Fetch all cards from the Open tickets list
  var trelloUrl = 'https://api.trello.com/1/lists/' + LIST_ID + '/cards'
    + '?key=' + TRELLO_KEY
    + '&token=' + TRELLO_TOKEN
    + '&fields=name,desc,dateLastActivity,shortUrl';

  var trelloRes;
  try {
    trelloRes = await fetch(trelloUrl);
  } catch (e) {
    return jsonResponse({ error: 'Failed to reach Trello' }, 502, cors);
  }

  if (!trelloRes.ok) {
    return jsonResponse({ error: 'Trello API error: ' + trelloRes.status }, 502, cors);
  }

  var cards = await trelloRes.json();
  var emailLower = email.toLowerCase();

  var tickets = cards
    .filter(function (c) {
      return c.desc && c.desc.toLowerCase().indexOf(emailLower) !== -1;
    })
    .map(function (c) {
      return {
        title: c.name,
        date: c.dateLastActivity,
        url: c.shortUrl,
      };
    });

  return jsonResponse({ tickets: tickets }, 200, cors);
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: Object.assign({}, corsHeaders, { 'Content-Type': 'application/json' }),
  });
}
