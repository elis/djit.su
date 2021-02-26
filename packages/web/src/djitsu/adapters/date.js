import { format, formatDistance } from 'date-fns'
const LONG_DATE = 'EEEE MMM d y HH:mm:ss z'

export const toLongDate = (date) => format(date, LONG_DATE)

export const timeAgo = (date) =>
  formatDistance(date, Date.now(), {
    addSuffix: true,
    includeSeconds: true
  })
