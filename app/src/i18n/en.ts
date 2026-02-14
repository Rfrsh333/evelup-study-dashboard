// English translations for LevelUp
export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
  },

  // Momentum modes
  momentum: {
    title: 'Momentum this week',
    score: 'Score',
    breakdown: 'Breakdown',
    consistency: 'Consistency',
    deadlineControl: 'Deadline control',
    focusScore: 'Focus score',
    streak: 'Streak',
    dayStreak: 'Day streak',
    sessions: 'Sessions',

    // Mode-specific guidance
    recoveryMode: 'Recovery mode',
    stableMode: 'Stable mode',
    performanceMode: 'Performance mode',

    recoveryGuidance: 'Recovery mode — focus on consistency today.',
    stableGuidance: 'Stable mode — keep your rhythm.',
    performanceGuidance: 'Performance mode — build a lead.',

    // Percentile
    topPercentile: 'Top {percentile}% this week',
    basedOnActiveUsers: 'Based on active users',

    // Badges
    top50Badge: 'Top 50%',
    top25Badge: 'Top 25%',
    top10Badge: 'Top 10%',
  },

  // Daily objectives
  dailyObjectives: {
    title: 'Daily goals',
    titleCompleted: 'Daily goals completed!',
    bonusReceived: '+{xp} XP bonus received',
    progressCount: '{completed} of {total} completed',
    bonusXP: 'Bonus XP',
    markComplete: 'Mark complete',

    // New performance-driven copy
    headerAfterCollege: 'Your focus block after class',
    startFocusButton: 'Start 25 min focus',

    // Micro feedback
    oneSessionForBonus: '1 more session for bonus XP',
    onTrackThisWeek: "You're on track this week",

    // Objective types
    focusSessions: 'Complete {target} focus sessions',
    studyMinutes: 'Study for {target} minutes',
    deadlineReview: 'Review upcoming deadlines',

    // Units
    minutes: 'minutes',
    sessions: 'sessions',
  },

  // Weekly challenges
  weeklyChallenge: {
    title: 'Weekly challenge',
    completed: 'Challenge completed — bonus XP earned',
    inProgress: '{current} of {target}',
    bonusXP: '+{xp} XP',

    // Challenge types
    focusSessions: '{target} focus sessions this week',
    studyDays: '{target} study days this week',
    studyMinutes: '{target} study minutes this week',
  },

  // Focus
  focus: {
    title: 'Focus session',
    start: 'Start focus',
    stop: 'Stop',
    complete: 'Complete',
    duration: '{minutes} minutes',
    xpAwarded: '+{xp} XP earned',
  },

  // Deadlines
  deadlines: {
    title: 'Deadlines',
    addDeadline: 'Add deadline',
    noDeadlines: 'No active deadlines',
    dueIn: 'In {days} days',
    overdue: '{days} days overdue',
    completed: 'Completed',

    // Status
    onTrack: 'On track',
    atRisk: 'At risk',
    failed: 'Failed',
  },

  // Study chart
  studyChart: {
    title: 'Study overview',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    hours: 'hours',
    minutes: 'minutes',
  },

  // Auth
  auth: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',

    // Errors
    invalidEmail: 'Invalid email address',
    invalidPassword: 'Password must be at least 6 characters',
    signInFailed: 'Sign in failed. Check your credentials.',
    signUpFailed: 'Sign up failed. Please try again.',
    sessionExpired: 'Your session has expired. Please sign in again.',
  },

  // Retention messaging
  retention: {
    // After-college ritual
    withinStudyWindow: 'This is your focus block.',
    outsideStudyWindow: 'Plan your next focus block.',

    // Loss aversion
    inactiveWarning: "Your momentum will drop if you don't do anything today. 1 session is enough.",
    streakBroken: 'Fresh start. Get 1 session today.',

    // Variable reward
    consistencyRising: 'Your consistency is rising faster than last week.',
    goodProgress: 'Strong progress this week.',
    keepGoing: 'Great work — keep it up.',
  },

  // Level up
  levelUp: {
    title: 'Level up!',
    newLevel: "You're now level {level}",
    congrats: 'Congratulations!',
    continue: 'Continue',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    studyWindow: 'Preferred study time window',
    from: 'From',
    to: 'To',
    notifications: 'Notifications',
    resetData: 'Reset data',
    confirmReset: 'Are you sure you want to delete all data?',
    pushCopy: 'Get a reminder at your focus moment.',
    pushNoSpam: 'No spam. 1–2/day.',
    notificationsEnabled: 'Notifications on',
    notificationsDisabled: 'Notifications off',
  },

  system: {
    dbLocalMode: {
      title: 'Database not configured. Local mode active.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },
} as const
