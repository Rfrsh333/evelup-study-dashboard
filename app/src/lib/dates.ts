import { format } from 'date-fns'

export function formatDate(date: Date, formatString: string = 'MMM d, yyyy'): string {
  return format(date, formatString)
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function getToday(): Date {
  return new Date()
}
