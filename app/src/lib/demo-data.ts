import { subDays, startOfDay, addHours } from 'date-fns'
import type { SchoolDeadline, FocusSession, StudyLog, PersonalEvent, Assessment } from '@/domain/types'

/**
 * Generate realistic demo data for development and testing
 */
export function generateDemoData(): {
  schoolDeadlines: SchoolDeadline[]
  personalEvents: PersonalEvent[]
  assessments: Assessment[]
  focusSessions: FocusSession[]
  studyLogs: StudyLog[]
} {
  const now = new Date()

  // Generate 5 deadlines with mixed statuses
  const schoolDeadlines: SchoolDeadline[] = [
    {
      id: 'demo-dl-1',
      title: 'Complete Linear Algebra Problem Set 3',
      deadline: addDays(now, 1),
      status: 'on-track',
      xp: 250,
      createdAt: subDays(now, 5),
      source: 'manual',
    },
    {
      id: 'demo-dl-2',
      title: 'React Authentication Module',
      deadline: addDays(now, 3),
      status: 'on-track',
      xp: 400,
      createdAt: subDays(now, 7),
      source: 'manual',
    },
    {
      id: 'demo-dl-3',
      title: 'Database Design Assignment',
      deadline: addDays(now, 2),
      status: 'at-risk',
      xp: 350,
      createdAt: subDays(now, 4),
      source: 'manual',
    },
    {
      id: 'demo-dl-4',
      title: 'Machine Learning Project Report',
      deadline: addDays(now, 7),
      status: 'on-track',
      xp: 500,
      createdAt: subDays(now, 10),
      source: 'manual',
    },
    {
      id: 'demo-dl-5',
      title: 'TypeScript Refactoring Task',
      deadline: subDays(now, 2),
      status: 'completed',
      xp: 300,
      createdAt: subDays(now, 14),
      completedAt: subDays(now, 3),
      source: 'manual',
    },
  ]

  const personalEvents: PersonalEvent[] = [
    {
      id: 'demo-pe-1',
      title: 'Werkcollege',
      start: addHours(startOfDay(now), 9),
      end: addHours(startOfDay(now), 10),
      source: 'manual',
    },
    {
      id: 'demo-pe-2',
      title: 'Boodschappen',
      start: addHours(startOfDay(now), 18),
      end: addHours(startOfDay(now), 19),
      source: 'manual',
    },
  ]

  // Generate 7 days of study logs with varying minutes
  const studyMinutes = [120, 180, 95, 210, 150, 240, 135] // Last 7 days
  const studyLogs: StudyLog[] = studyMinutes.map((minutes, index) => ({
    id: `demo-log-${index}`,
    date: startOfDay(subDays(now, 6 - index)),
    minutes,
    xpAwarded: 5, // Study day XP
    notes: index % 2 === 0 ? 'Focused study session' : undefined,
  }))

  // Generate 8 focus sessions over the last 7 days
  const focusSessions: FocusSession[] = [
    createFocusSession('demo-fs-1', subDays(now, 6), 25),
    createFocusSession('demo-fs-2', subDays(now, 6), 25),
    createFocusSession('demo-fs-3', subDays(now, 5), 25),
    createFocusSession('demo-fs-4', subDays(now, 4), 25),
    createFocusSession('demo-fs-5', subDays(now, 3), 25),
    createFocusSession('demo-fs-6', subDays(now, 2), 25),
    createFocusSession('demo-fs-7', subDays(now, 1), 25),
    createFocusSession('demo-fs-8', subDays(now, 0), 25),
  ]

  return {
    schoolDeadlines,
    personalEvents,
    assessments: [],
    focusSessions,
    studyLogs,
  }
}

function createFocusSession(id: string, date: Date, duration: number): FocusSession {
  const startTime = addHours(date, 10) // Start at 10am
  return {
    id,
    startTime,
    endTime: addHours(startTime, duration / 60),
    duration,
    completed: true,
    xpAwarded: 10,
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
