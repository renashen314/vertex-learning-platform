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
          {title: 'Cloud', value: 'cloud'},
          {title: 'Code', value: 'code'},
          {title: 'Database', value: 'database'},
          {title: 'Gauge', value: 'gauge'},
          {title: 'Layers', value: 'layers'},
          {title: 'Puzzle', value: 'puzzle'},
          {title: 'Rocket', value: 'rocket'},
          {title: 'Shield', value: 'shield'},
          {title: 'Sparkles', value: 'sparkles'},
          {title: 'Terminal', value: 'terminal'},
          {title: 'Workflow', value: 'workflow'},
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
