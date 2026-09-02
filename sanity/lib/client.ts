import 'server-only'

import {createClient} from 'next-sanity'

import {apiVersion, dataset, getReadToken, projectId} from '../env'

/**
 * The only Sanity client in the app. Server-only by construction:
 *
 * - `server-only` turns any client-component import into a build error.
 * - The read token never leaves this module.
 * - `useCdn: false` because the dataset is private and Next.js already owns
 *   caching (see `sanity/lib/fetch.ts`). The Sanity CDN would add a second,
 *   uninvalidatable staleness layer on top of our revalidation tags.
 * - `perspective: 'published'` keeps unpublished drafts out of every response.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: getReadToken(),
  useCdn: false,
  perspective: 'published',
})
