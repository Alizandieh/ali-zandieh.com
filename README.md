# ali-zandieh.com

Personal portfolio website for **Ali Zandieh**, Lead Platform Engineer | DevOps | SRE.

The site uses a "Designed in glass" hero: a Three.js scene of smoked-glass shards that tilt with the pointer, lift on hover, and shatter into a definitions view when you click "Read paper →". Portfolio content (about, skills, experience, education, and contact links) is printed on the glass and is reachable from the page. A static, styled fallback is served for reduced-motion users and browsers without WebGL.

## Project structure

```
public/            Static site served to visitors
  index.html       Main page (content, structured data, contact links)
  styles.css       Styles, including the static fallback layout
  js/              Scene, layout, and page scripts
  images/          Images (profile photo)
  fonts/           Inter font
  robots.txt, sitemap.xml
src/worker.js      Cloudflare Worker: redirects www to the apex domain, serves assets
server.mjs         Small Node.js static file server for local development
wrangler.jsonc     Cloudflare Workers / static assets configuration
package.json       Scripts and dependencies
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/installation)

## Running the site locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the local server:

   ```bash
   pnpm start
   ```

3. Open <http://localhost:3000> in your browser.

To use a different port, set the `PORT` environment variable:

```bash
PORT=8080 pnpm start
```

`pnpm start` runs `server.mjs`, which serves everything in `public/` with no build step. Editing a file and refreshing the browser shows the change immediately.

### Testing the Cloudflare Worker locally

The production deployment runs on Cloudflare Workers via Wrangler. To run it locally with the same configuration:

```bash
pnpm dev
```

This starts `wrangler dev`, which serves the site through the Worker and its asset binding, the same way it runs in production. Wrangler may ask you to log in to Cloudflare the first time you run it.

## Deployment

The site is deployed to Cloudflare Workers:

```bash
pnpm deploy
```

This runs `wrangler deploy` using the settings in `wrangler.jsonc`. You need access to the Cloudflare account that owns the `ali-zandieh-website` Worker.

## Contact

- Email: [contact@ali-zandieh.com](mailto:contact@ali-zandieh.com)
- Website: <https://ali-zandieh.com>
- LinkedIn: <https://www.linkedin.com/in/ali-zandieh-platform>
