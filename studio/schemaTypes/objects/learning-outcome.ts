import {defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons'

/**
 * One item in a course's "What you'll learn" grid.
 * `icon` stores a key, not a glyph — the frontend owns the artwork.
 */
export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning Outcome',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          {title: 'Layers', value: 'layers'},
          {title: 'Database', value: 'database'},
          {title: 'Gauge', value: 'gauge'},
          {title: 'Cloud', value: 'cloud'},
          {title: 'Shield', value: 'shield'},
          {title: 'Terminal', value: 'terminal'},
          {title: 'Sparkles', value: 'sparkles'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(160),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
