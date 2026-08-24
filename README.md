# Discograph

An interactive graph visualization for exploring artists, labels, and releases on [Discogs](https://www.discogs.com).

## Development

Development runs a SvelteKit server with a same-origin Discogs API proxy. Credentials stay in `.env` on the server and are never exposed to the browser.

1. Register an application at [Discogs Developer Settings](https://www.discogs.com/settings/developers).

2. Create a `.env` file using one of the following options:

**Option A — Personal access token (simplest):**

```
DISCOGS_TOKEN=your_personal_access_token
DISCOGS_USER_AGENT=Discograph/1.0 +http://localhost:5173
```

**Option B — Consumer key and secret:**

```
DISCOGS_CONSUMER_KEY=your_consumer_key
DISCOGS_CONSUMER_SECRET=your_consumer_secret
DISCOGS_USER_AGENT=Discograph/1.0 +http://localhost:5173
```

SvelteKit reads credentials from `.env` at runtime. Restart the dev server after changing env vars.

3. Install dependencies and start the dev server:

```bash
yarn
yarn dev
```

In development, the node panel includes a **View Payload** link that opens raw JSON from the local proxy.

## Production (GitHub Pages)

The production build is a static SPA that calls `https://api.discogs.com` directly from the browser without authentication (25 requests/minute per Discogs rate limits). No `.env` file is required.

Build for GitHub Pages (adjust `BASE_PATH` to match your repository name):

```bash
yarn build:pages
```

Preview the production build locally:

```bash
yarn preview
```

Deploy the contents of the `build/` directory to GitHub Pages.

## Usage

- Search for an artist, label, release, or master.
- The seed entity appears in the graph.
- Click a node to expand and fetch more related data.
- Drag nodes, zoom, and pan to explore the graph.

## Tech

- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [D3](https://d3js.org/) force-directed layout
- [Discogs API v2](https://www.discogs.com/developers) (proxied server-side in development; direct client calls in production)
