# Discograph

An interactive graph visualization for exploring artists, labels, and releases on [Discogs](https://www.discogs.com).

## Setup

1. Register an application at [Discogs Developer Settings](https://www.discogs.com/settings/developers).

2. Create and configure a .env file using one of the following options

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

## Usage

- Search for an artist, label, release, or master.
- The seed entity appears in the graph.
- Click a node to expand and fetch more related data.
- Drag nodes, zoom, and pan to explore the graph.

## Tech

- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [D3](https://d3js.org/) force-directed layout
- Discogs API v2 (proxied server-side to protect credentials)
