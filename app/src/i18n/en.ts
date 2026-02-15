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
    title: 'Performance Index',
    score: 'Index',
    breakdown: 'Breakdown',
    consistency: 'Consistency',
    deadlineControl: 'Deadline adherence',
    focusScore: 'Focus consistency',
    streak: 'Weekly streak',
    dayStreak: 'Day streak',
    sessions: 'Sessions',

    // Mode-specific guidance
    recoveryMode: 'Recovery',
    stableMode: 'Baseline',
    performanceMode: 'Elite',

    recoveryGuidance: 'Recovery mode. Restore baseline today.',
    stableGuidance: 'Baseline maintained. Push harder.',
    performanceGuidance: 'Elite performance secured.',

    // Percentile
    topPercentile: 'Top {percentile}%',
    basedOnActiveUsers: 'Active students this week',

    // Badges
    top50Badge: 'Top 50%',
    top25Badge: 'Top 25%',
    top10Badge: 'Top 10%',
  },

  // Daily objectives
  dailyObjectives: {
    title: 'Today',
    titleCompleted: 'Objectives complete.',
    bonusReceived: '+{xp} XP secured',
    progressCount: '{completed}/{total} complete',
    bonusXP: 'Bonus XP',
    markComplete: 'Complete',

    // New performance-driven copy
    headerAfterCollege: 'Lock in after class',
    startFocusButton: 'Start session',

    // Micro feedback
    oneSessionForBonus: '1 session left for bonus',
    onTrackThisWeek: 'On track',

    // Objective types
    focusSessions: '{target} focus sessions',
    studyMinutes: '{target} minutes',
    deadlineReview: 'Review deadlines',

    // Units
    minutes: 'min',
    sessions: 'sessions',
  },

  // Weekly challenges
  weeklyChallenge: {
    title: 'Weekly target',
    completed: 'Target achieved — bonus secured',
    inProgress: '{current}/{target}',
    bonusXP: '+{xp} XP',

    // Challenge types
    focusSessions: '{target} sessions',
    studyDays: '{target} active days',
    studyMinutes: '{target} minutes',
  },

  // Focus
  focus: {
    title: 'Session',
    start: 'Start',
    stop: 'Stop',
    complete: 'Complete',
    duration: '{minutes} min',
    xpAwarded: '+{xp} XP',
  },

  // Focus block card
  focusBlock: {
    title: 'Focus session',
    helper: 'Maintain consistency. Execute daily.',
    ctaSecondary: 'View schedule',
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
    withinStudyWindow: 'Execute now.',
    outsideStudyWindow: 'Schedule next block.',

    // Loss aversion
    inactiveWarning: 'Your index drops if you skip today. 1 session protects your average.',
    streakBroken: 'Streak lost. Recover today.',

    // Variable reward
    consistencyRising: 'Consistency rising faster than last week.',
    goodProgress: 'Strong week. Maintain position.',
    keepGoing: 'Consistency secured.',
  },

  // Level up
  levelUp: {
    title: 'Level {level}',
    newLevel: 'Level {level} achieved',
    congrats: 'Progress confirmed.',
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
    startHere: {
      title: 'Connect your data in 2 minutes',
      subtitle:
        'Once your schedule and grades are in, LevelUp organizes your week and shows what you need to do to pass.',
      progress: '{count}/2 connected',
      stepSchedule: 'Import schedule (ICS)',
      stepGrades: 'Import grades (PDF/CSV)',
    },
    step: {
      done: 'Completed',
    },
    steps: {
      valueTitle: 'What do you get?',
      schedule: {
        title: 'Step 1 — Import schedule',
        value: 'Your classes show up in Week. You get focus block suggestions around your schedule.',
        ctaImport: 'Import schedule (ICS)',
        ctaViewWeek: 'View Week',
      },
      grades: {
        title: 'Step 2 — Import grades',
        value: 'Block overview (Passed/Open) + predicted/required grade per course.',
        tabPdf: 'PDF (recommended)',
        tabCsv: 'CSV (alternative)',
        ctaViewDashboard: 'View Dashboard',
      },
    },
    faq: {
      ics: {
        title: 'How do I get an ICS?',
        body: 'Export your schedule/agenda as .ics. If you can’t find it, ask your program for an ICS link.',
      },
      grades: {
        title: 'How do I export grades?',
        body: 'Download the Brightspace Progress Summary (PDF) or export a CSV of grades.',
      },
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
      title: 'Priorities',
      cta: 'View deadlines',
      empty: 'No urgent deadlines (72h).',
    },
    personal: {
      title: 'Schedule',
      cta: 'Import calendar',
      empty: 'No events today.',
      viewWeek: 'View week',
    },
    focusSuggestion: {
      title: 'Suggested session',
      body: 'Free slot at {time}. Schedule {minutes} min.',
      reason: {
        preferred: 'Optimal window (post-class).',
        deadline: 'Before next deadline.',
        gap: 'Largest free block.',
      },
      cta: {
        schedule: 'Schedule session',
        otherTime: 'Different time',
      },
      empty: 'No free slot. Manual scheduling required.',
      focusTitle: 'Focus ({minutes} min)',
    },
  },

  week: {
    filter: {
      school: 'School',
      personal: 'Personal',
    },
    schoolTitle: 'Deadlines',
    personalTitle: 'Schedule',
    emptySchool: 'No deadlines.',
    emptyPersonal: 'No events.',
    preview: {
      title: 'Week overview',
      empty: 'No items this week.',
      viewWeek: 'View full week',
    },
    tag: {
      school: 'School',
      personal: 'Personal',
    },
  },

  dashboard: {
    promise: {
      title: 'Elite Academic Performance Optimizer',
      subtitle: 'Track performance. Protect your average. Stay in top 10%.',
    },
    hero: {
      title: 'Performance',
      subtitle: 'Index, rankings, and targets',
    },
    onboarding: {
      step: 'Step {step}',
      step1: 'Import schedule (ICS)',
      step2: 'Import grades (PDF/CSV)',
      step3: 'Schedule first session',
    },
    startHere: {
      title: 'Setup required',
      subtitle: 'Connect data to calculate Performance Index.',
      compact: 'Import schedule and grades for full performance tracking.',
      bullets: {
        importCalendar: 'Import schedule → weekly planning',
        importGrades: 'Import grades → performance tracking',
        makeFocusBlocks: 'Execute sessions → maintain index',
      },
      cta: {
        importCalendar: 'Import schedule',
        importGrades: 'Import grades',
        viewWeek: 'View week',
      },
    },
  },

  system: {
    dbLocalMode: {
      title: 'Database not configured. Local mode active.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },
} as const
