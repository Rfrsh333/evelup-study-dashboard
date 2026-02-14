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
    focusWindow: 'Preferred focus window',
    focusMinutes: 'Focus duration (min)',
  },

  integrations: {
    header: 'Integrations',
    explainer: 'Brightspace syncs deadlines and grades. Calendar import adds upcoming deadlines.',
    onboarding: {
      title: 'Brightspace import (beta)',
      subtitle: 'Import deadlines (ICS) and grades (CSV) in two quick steps.',
      step: 'Step {step}',
    },
    brightspace: {
      title: 'Brightspace',
      description: 'Brightspace integration via school license.',
      connect: 'Request your school to activate LevelUp',
      note: 'OAuth runs server-side; your password stays with Brightspace.',
    },
    calendar: {
      title: 'Calendar import',
      description: 'Import deadlines from your calendar (.ics) into LevelUp.',
      import: 'Import calendar',
      refreshNote: 'Tip: add an ICS URL for quick refresh.',
      imported: '{count} items imported',
      previewTitle: 'We found {count} events',
      confirm: 'Import',
      cancel: 'Cancel',
      errorNoVevent: 'No appointments found in this file. BEGIN:VEVENT is missing.',
      errorEmpty: 'No appointments found in this file.',
      errorParse: 'We found events but could not parse them.',
      errorOutOfWindow:
        'We found {count} events, but they’re outside the selected time window (all in the past or too far ahead).',
      window: 'Window: {start} to {end}',
      includeRecent: 'Include past 14 days',
      debugTotals: 'Parsed: {parsed} · Kept: {kept} · Dropped: {dropped}',
      debugToggle: 'Open debug details',
      debugVevents: 'VEVENT count: {count}',
      outOfWindow:
        'We found {count} events, but they’re outside your current view (e.g. in the past). Check Week view or widen your time window.',
      urlPlaceholder: 'Paste your ICS URL (optional)',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      refreshError: 'We could not fetch the ICS feed (CORS or network issue).',
      refreshErrorTitle: 'Calendar URL blocked',
      refreshSuccess: 'Calendar refreshed',
      uploadCta: 'Upload .ics file',
      needsManual: 'Manual upload needed. Keep the URL saved and upload a file when blocked.',
    },
    csv: {
      title: 'Grades CSV',
      description: 'Import your Brightspace grades with a CSV export.',
      upload: 'Upload CSV',
      import: 'Import grades',
      preview: 'Preview import',
      previewTitle: 'Preview',
      previewStats: '{rows} rows · {courses} courses',
      previewSummary: 'Example: {course} · predicted {predicted} · required {required}',
      confirm: 'Confirm import',
      back: 'Back',
      rows: '{count} rows detected',
      waiting: 'Waiting for CSV',
      imported: '{count} grades imported',
      pastePlaceholder: 'Paste CSV here…',
      blockLabel: 'Block label',
      parseError: 'Unable to read CSV. Please check the file format.',
      mapping: {
        course: 'Course column',
        item: 'Item column',
        score: 'Score column',
        weight: 'Weight column',
        date: 'Date column',
        status: 'Status column',
        block: 'Block column',
        optional: 'Optional',
      },
    },
    pdf: {
      title: 'Progress Summary PDF',
      description: 'Upload the Brightspace Progress Summary PDF to import competencies.',
      upload: 'Upload PDF',
      analyze: 'Analyze PDF',
      analyzing: 'Analyzing…',
      found: 'Found {total} items ({passed} passed, {pending} open)',
      confirm: 'Confirm import',
      back: 'Back',
      remove: 'Remove',
      blockLabel: 'Block label',
      parseError: 'Unable to read the PDF. Try exporting again.',
      empty: 'No items detected in this PDF.',
      warning: 'Some items could not be parsed. Please review the list below.',
      imported: '{count} items imported',
    },
    lti: {
      title: 'School integration (LTI)',
      description: 'For school licenses. Requires admin installation.',
      comingSoon: 'Coming soon',
    },
    status: {
      connected: 'Connected',
      disconnected: 'Not connected',
      localMode: 'Local mode',
    },
    ltiRequested: 'We will contact your school IT.',
  },

  insights: {
    dauTitle: 'DAU (last 14 days)',
    d1Title: 'D1 retention',
    d1Subtitle: 'Last 14 signup cohorts',
    w1Title: 'W1 retention',
    w1Subtitle: 'Last 8 cohorts',
    adminOnly: 'Insights are limited to admins.',
  },

  grades: {
    title: 'Grades',
    predicted: 'Predicted final',
    required: 'Required remaining average',
    placeholder: 'Connect Brightspace to see predictions.',
    empty: 'No grades found yet.',
    cta: 'Connect Brightspace',
  },

  blockProgress: {
    title: 'Block progress',
    blockLabel: 'Block {block}',
    noBlock: 'No block selected',
    summary: '{passed}/{total} items passed',
    subtitle: '{pending} open · {failed} failed · {percent}% passed',
    empty: 'No block progress yet.',
    cta: 'Import Brightspace progress (CSV/PDF)',
    viewAll: 'View block overview',
    status: {
      passed: 'Passed',
      failed: 'Not passed',
      pending: 'Open',
    },
  },

  blockOverview: {
    title: 'Block overview',
    empty: 'No block data yet.',
  },

  today: {
    school: {
      title: 'School: priorities',
      cta: 'Go to deadlines overview',
      empty: 'No urgent school deadlines within 72h.',
    },
    personal: {
      title: 'Personal: today plan',
      cta: 'Import calendar',
      empty: 'No personal events today.',
      viewWeek: 'View week',
    },
    focusSuggestion: {
      title: 'Suggested focus block',
      body: 'You have a free slot at {time}. Schedule {minutes} min focus.',
      reason: {
        preferred: 'Fits your routine (after class).',
        deadline: 'Before your next deadline.',
        gap: 'Largest free slot today.',
      },
      cta: {
        schedule: 'Schedule focus block',
        otherTime: 'Pick another time',
      },
      empty: 'No free slot found. Plan manually.',
      focusTitle: 'Focus block ({minutes} min)',
    },
  },

  week: {
    filter: {
      school: 'School',
      personal: 'Personal',
    },
    schoolTitle: 'School deadlines',
    personalTitle: 'Personal events',
    emptySchool: 'No school deadlines yet.',
    emptyPersonal: 'No personal events yet.',
    tag: {
      school: 'School',
      personal: 'Personal',
    },
  },

  dashboard: {
    promise: {
      title: 'See what you need to do today to pass — and turn it into focus blocks.',
      subtitle: 'Start here and get clarity in 3 quick steps.',
    },
    onboarding: {
      step: 'Step {step}',
      step1: 'Import your schedule (ICS)',
      step2: 'Import your block progress (PDF/CSV)',
      step3: 'Plan your focus block for today',
    },
  },

  system: {
    dbLocalMode: {
      title: 'Database not configured. Local mode active.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },
} as const
