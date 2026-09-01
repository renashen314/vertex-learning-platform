import 'server-only'

import type {QueryParams} from 'next-sanity'

import {client} from './client'

/** Revalidation tags, one per document type. */
export const CONTENT_TAGS = {
  course: 'course',
  lesson: 'lesson',
  instructor: 'instructor',
  category: 'category',
} as const

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS]

const DEFAULT_REVALIDATE = 3600

type SanityFetchOptions<QueryString extends string> = {
  query: QueryString
  params?: QueryParams
  /** Seconds. `false` caches indefinitely and relies on tag revalidation alone. */
  revalidate?: number | false
  tags?: ContentTag[]
}

/**
 * The single read path for content.
 *
 * `cacheComponents` is not enabled in `next.config.ts`, so Next 16 does not
 * cache `fetch` by default and `use cache` is unavailable. Caching is opted
 * into explicitly here with `next: { revalidate, tags }`, which is the
 * supported model with Cache Components off.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = DEFAULT_REVALIDATE,
  tags = [],
}: SanityFetchOptions<QueryString>) {
  return client.fetch(query, params, {
    next: {revalidate, tags},
  })
}
