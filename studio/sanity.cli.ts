/**
 * Lets you run `$ sanity [command]` in this folder.
 * https://www.sanity.io/docs/cli
 */
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  // Deployed to https://vertex-video-search.sanity.studio/. Pinning the app id
  // avoids an interactive hostname prompt on future `sanity deploy` runs.
  deployment: {
    appId: 't10kna1j2xjzjedq0lahozfz',
  },
  // TypeGen reads GROQ queries from the web workspace (the repo root) and
  // writes the generated types back there. The globs are explicit so the
  // scan never walks node_modules.
  typegen: {
    enabled: true,
    path: '../{app,components,sanity}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
