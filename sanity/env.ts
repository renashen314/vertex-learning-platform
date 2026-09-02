// https://www.sanity.io/docs/api-versioning
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

/**
 * Read token for the private dataset.
 *
 * Deliberately NOT prefixed `NEXT_PUBLIC_`, and resolved lazily so that
 * importing this module from a client component (for `projectId` in the image
 * URL builder, say) never pulls the secret into the browser bundle.
 * Only `sanity/lib/client.ts`, which is `server-only`, may call this.
 */
export function getReadToken(): string {
  return assertValue(
    process.env.SANITY_API_READ_TOKEN,
    'Missing environment variable: SANITY_API_READ_TOKEN',
  )
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
