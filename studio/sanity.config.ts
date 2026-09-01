import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schema} from './schemaTypes'
import {structure} from './structure'

const projectId = requireEnv('SANITY_STUDIO_PROJECT_ID')
const dataset = requireEnv('SANITY_STUDIO_DATASET')

// https://www.sanity.io/docs/api-versioning
const apiVersion = '2026-09-01'

export default defineConfig({
  name: 'vertex',
  title: 'Vertex',
  projectId,
  dataset,
  schema,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion})],
})

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. See studio/.env.example`)
  }
  return value
}
