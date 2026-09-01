import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

/**
 * A lesson does not store its parent course. The course is derived with a
 * reverse reference (`*[_type == "course" && references(^._id)]`), which keeps
 * a lesson from drifting out of sync with the module that lists it.
 */
export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'video', title: 'Video'},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      group: 'overview',
      description: 'The line under the lesson title.',
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      group: 'overview',
      description: 'Stored in seconds. Course and module totals are summed from these.',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'studentCount',
      title: 'Student count',
      type: 'number',
      group: 'overview',
      description: 'Display only.',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'freePreview',
      title: 'Free preview',
      type: 'boolean',
      group: 'overview',
      description: 'A label only. This does not grant or restrict access.',
      initialValue: false,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'video',
      description: 'YouTube, Vimeo, or Bunny URL. Played on the lesson page as an embed.',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['http', 'https']})
          .error('Must be a valid URL starting with http:// or https://'),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      group: 'video',
      options: {hotspot: true},
      description: 'Poster frame shown before playback and on search result cards.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key points',
      type: 'array',
      group: 'content',
      description: 'The "In this lesson you will" checklist.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1).max(8).unique(),
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'array',
      group: 'content',
      description: 'The lesson body, shown as "Overview".',
      of: [defineArrayMember({type: 'block'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'proTip',
      title: 'Pro tip',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'resources',
      title: 'Resources',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'lessonResource'})],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'thumbnail', durationSeconds: 'durationSeconds'},
    prepare({title, media, durationSeconds}) {
      return {
        title: title || 'Untitled lesson',
        subtitle: formatDuration(durationSeconds),
        media,
      }
    },
  },
})

function formatDuration(totalSeconds?: number): string | undefined {
  if (typeof totalSeconds !== 'number' || totalSeconds <= 0) return undefined
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
