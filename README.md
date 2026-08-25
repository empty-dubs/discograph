# Discograph

An interactive graph visualization for exploring artists, labels, and releases on [Discogs](https://www.discogs.com).

## Disclaimer

I've built versions of this app before in javascript and python so I already had a rough idea of what I was going for with this project. That said, I'm not an expert in the languages and frameworks I chose (Typescript, [Svelte](https://svelte.dev/), [D3](https://d3js.org/)). I'm a data person who knows enough about each to get around.

A lot of this was built with the assistance of Cursor, but this is far from a one-shot. This is my first foray into AI-assisted development, so this has mostly been an experiment to study how I fare with a tool like this. I've learned quite a lot and I'll probably do things very differently in my next endeavor.

 If you find yourself reading the code, just know that
- some of the code was written by me
- some of the code was written by Cursor and I agree with the design so it stayed
- some of the code written by Cursor was bad or it didn't match up with established design patterns so I reworked it or filled things in
- sometimes Cursor wrote a solution I wouldn't have picked or thought of (there's still so much to learn) and it remains as is though I may go back and clean things up in the future

In other words, I don't totally sanction what's written here, but I'm also trying to embrace treating code as more of a tool than an art form.

If you have comments, find bugs, or have recommendations for improvement, feel free to contribute.

## Development

Development runs a [SvelteKit](https://kit.svelte.dev/) server with a same-origin Discogs API proxy. Credentials stay in `.env` on the server and are never exposed to the browser.

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

SvelteKit reads credentials from `.env` at runtime. Restart the dev server after changing environment variables.

3. Install dependencies and start the dev server:

```bash
yarn
yarn dev
```

Note: In development, the node panel includes a **View Payload** link that opens raw JSON from the local proxy.

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
