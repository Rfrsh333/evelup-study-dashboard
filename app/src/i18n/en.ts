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
    continue: 'Continue',
    language: 'Language',
    errors: {
      generic: 'Something went wrong.',
      network: 'Network issue. Try again.',
      invalidFile: 'File cannot be read',
      duplicateDetected: 'Duplicate detected. Skip.',
      parseFailed: 'Parse error. Check format.',
    },
  },

  tiers: {
    elite: 'Elite',
    highPerformer: 'High Performer',
    onTrack: 'On Track',
    needsImprovement: 'Needs Improvement',
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
    notificationsUnsupported: 'Notifications are not supported in this browser.',
    errors: {
      missingVapid: 'Missing VAPID public key.',
      subscriptionFailed: 'Failed to register push subscription.',
      invalidSubscription: 'Invalid push subscription.',
    },
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
    performanceIndex: {
      title: 'Performance Index',
      percentile: 'Top {value}%',
      rank: 'Position {value}',
    },
    trend: {
      up: 'You’re climbing. Solid.',
      down: 'You’re slipping. Fix it.',
      steady: 'Stable. But you can push higher.',
    },
    promise: {
      title: 'Elite Academic Performance Optimizer',
      subtitle: 'Track performance. Protect your average. Stay in top 10%.',
    },
    hero: {
      title: 'Performance',
      subtitle: 'Index, rankings, and targets',
    },
    nextUp: {
      title: 'Next up',
      nextClass: 'Next class',
      nextDeadline: 'Next deadline',
      todaySummary: 'Today',
      todayCounts: '{classes} classes · {deadlines} deadlines',
      noClasses: 'No upcoming classes in your schedule.',
      noDeadlines: 'No deadlines known',
      now: 'now',
      inTime: 'in {value}',
      ctaImportRoster: 'Import schedule',
      ctaViewWeek: 'View week',
    },
    todayEvents: {
      title: 'Today',
      empty: 'No classes scheduled for today.',
      ctaMore: 'View more',
    },
    eliteHeader: {
      title: 'Performance Index',
      labelPercentile: 'Top {value}%',
      labelRank: '#{value}',
      labelTargetAverage: 'Target avg',
      labelScoreGap: 'Gap',
      trend: {
        up: '↑',
        down: '↓',
        steady: '→',
      },
    },
    onboarding: {
      step: 'Step {step}',
      step1: 'Import schedule (ICS)',
      step2: 'Import grades (PDF/CSV)',
      step3: 'Schedule first session',
    },
    startHere: {
      title: 'Start here',
      subtitle: 'In 2 minutes you’ll know what to do today to pass.',
      compact: 'Check your week or import more data to plan faster.',
      bullets: {
        importCalendar: 'Import your schedule → see your week',
        importGrades: 'Import your grades → see what you need to score',
        makeFocusBlocks: 'Create focus blocks to get it done',
      },
      cta: {
        importCalendar: 'Import schedule',
        importGrades: 'Import grades',
        viewWeek: 'View week',
      },
    },
  },

  // Performance tiers & messages (Elite tone)
  performance: {
    tiers: {
      elite: 'Elite',
      highPerformer: 'High Performer',
      onTrack: 'On Track',
      needsImprovement: 'Needs Focus',
    },
    message: {
      win: 'Clean. That’s top-tier behavior.',
      steady: 'You’re in the game. Not winning yet.',
      drop: 'Not your week. No excuses. One block + one focused session. Reset.',
      hardDrop: 'This is sliding. Keep this up and your tier drops.',
      nearMiss: 'You’re {delta} away from Elite. One strong week and you’re in.',
      momentumRisk: 'Momentum is fading. Another week like this and you drop.',
      eliteConsistency: 'Staying Elite is harder than reaching it. Hold it.',
    },
    messages: {
      // Win scenario
      win: 'Solid. Keep it steady.',
      winElite: 'Top {percentile}% this week. Stay sharp.',

      // Steady
      steady: 'Stable. But you can go higher.',
      steadyPush: "Index at {index}. One strong week and you're Elite.",

      // Drop
      drop: 'Not your week. Reset: 1 block + 1 focused session.',
      dropHard: 'Index dropping. Two more days like this and your grade collapses. Act now.',

      // Near miss
      nearMiss: "{delta} points from Elite. One strong week and you're in.",

      // Momentum at risk
      momentumRisk: 'Momentum dropping. Two more days and your index collapses.',

      // Streak broken
      streakBroken: 'Streak broken. Fresh start: get 1 session today.',

      // Consistency rising
      consistencyRising: 'Consistency rising faster than last week. Clean.',
    },
  },

  // Block progress
  blocks: {
    status: {
      passed: 'Passed',
      failed: 'Failed',
      pending: 'Open',
    },
  },

  // Groups
  groups: {
    position: '#{position}',
    percentileInGroup: 'Top {value}% in group',
    movedUp: '↑ {positions} up',
    movedDown: '↓ {positions} down',
    noChange: '→ No change',
    positionLabel: 'Position {value}',
    percentile: 'Top {value}% in your group',
    movedUpLabel: '+{value} positions',
    movedDownLabel: '-{value} positions',
    noChangeLabel: 'No movement',
    pressureMessage: 'Everyone sees movement. So do you.',
  },

  system: {
    dbLocalMode: {
      title: 'Database not configured. Local mode active.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },

  // Integrations Brightspace
  integrations: {
    import: {
      csv: 'Import grades (CSV)',
      pdf: 'Import progress (PDF)',
      ics: 'Import deadlines (ICS)',
      success: 'Data synced. Time to perform.',
      failed: 'File invalid. Check it.',
    },
    brightspace: {
      title: 'Brightspace',
      importCsv: 'Import CSV',
      importPdf: 'Import PDF',
      importIcs: 'Import ICS',
      status: {
        importing: 'Importing...',
        success: 'Success',
        failed: 'Failed',
      },
      errors: {
        invalidFile: 'Invalid file',
        duplicateDetected: 'Duplicate detected',
        parseFailed: 'Parse error',
      },
    },
  },

  paywall: {
    elite: {
      title: 'Elite Mode',
      subtitle: 'For students who want to compete seriously.',
      cta: 'Unlock Elite',
      pressure: 'Others see more data than you do.',
      benefits: {
        history: '90-day performance history',
        groups: 'Groups & leaderboards',
        breakdown: 'Full index breakdown',
        reports: 'Monthly performance report',
      },
    },
  },

  // Elite tier paywall
  elite: {
    badge: 'Elite',
    freeBadge: 'Free',
    upgradeCta: 'Upgrade to Elite',
    upgradeTitle: 'Unlock Elite Performance',
    upgradeSubtitle: '€2.50/month · Cancel anytime',
    benefits: {
      title: 'What you get',
      historyDays: '90-day performance history',
      groups: 'Private study groups (max 5)',
      breakdown: 'Detailed index breakdown',
      reports: 'Monthly performance reports',
    },
    locked: {
      groups: 'Performance groups — Elite only',
      breakdown: 'Detailed breakdown — Elite only',
      history: '90-day history — Elite only',
      reports: 'Monthly reports — Elite only',
    },
    comparison: {
      title: 'Free vs Elite',
      free: 'Free',
      elite: 'Elite',
      featureIndex: 'Performance Index',
      featureHistory: 'History',
      featureGroups: 'Groups',
      featureReports: 'Reports',
      featureTrends: 'Trends',
      basicIndex: 'Basic (0-100)',
      fullBreakdown: 'Full breakdown',
      sevenDays: '7 days',
      ninetyDays: '90 days',
      noGroups: 'Not available',
      upToFive: 'Up to 5',
      weekOnly: 'Week-over-week',
      fullTrends: '90-day trends',
    },
    upsell: 'Your index is stagnating. Elite users see breakdowns + can join groups. €2.50/month.',
  },
} as const
