// Dutch (Nederlands) translations for LevelUp
export const nl = {
  // Common
  common: {
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    close: 'Sluiten',
    confirm: 'Bevestigen',
    back: 'Terug',
    next: 'Volgende',
  },

  // Momentum modes
  momentum: {
    title: 'Momentum deze week',
    score: 'Score',
    breakdown: 'Uitsplitsing',
    consistency: 'Consistentie',
    deadlineControl: 'Deadline controle',
    focusScore: 'Focus score',
    streak: 'Streak',
    dayStreak: 'Dag streak',
    sessions: 'Sessies',

    // Mode-specific guidance
    recoveryMode: 'Herstelmodus',
    stableMode: 'Stabiele modus',
    performanceMode: 'Prestatiemodus',

    recoveryGuidance: 'Herstelmodus — focus op consistentie vandaag.',
    stableGuidance: 'Stabiele modus — houd je ritme vast.',
    performanceGuidance: 'Prestatiemodus — bouw een voorsprong.',

    // Percentile
    topPercentile: 'Top {percentile}% deze week',
    basedOnActiveUsers: 'Gebaseerd op actieve gebruikers',

    // Badges
    top50Badge: 'Top 50%',
    top25Badge: 'Top 25%',
    top10Badge: 'Top 10%',
  },

  // Daily objectives
  dailyObjectives: {
    title: 'Dagdoelen',
    titleCompleted: 'Dagdoelen voltooid!',
    bonusReceived: '+{xp} XP bonus ontvangen',
    progressCount: '{completed} van {total} voltooid',
    bonusXP: 'Bonus XP',
    markComplete: 'Markeer voltooid',

    // New performance-driven copy
    headerAfterCollege: 'Jouw focusblok na college',
    startFocusButton: 'Start 25 min focus',

    // Micro feedback
    oneSessionForBonus: 'Nog 1 sessie voor bonus XP',
    onTrackThisWeek: 'Je bent op koers deze week',

    // Objective types
    focusSessions: 'Voltooi {target} focussessies',
    studyMinutes: 'Studeer {target} minuten',
    deadlineReview: 'Bekijk aankomende deadlines',

    // Units
    minutes: 'minuten',
    sessions: 'sessies',
  },

  // Weekly challenges
  weeklyChallenge: {
    title: 'Weekchallenge',
    completed: 'Challenge voltooid — bonus XP verdiend',
    inProgress: '{current} van {target}',
    bonusXP: '+{xp} XP',

    // Challenge types
    focusSessions: '{target} focussessies deze week',
    studyDays: '{target} studeerdagen deze week',
    studyMinutes: '{target} studeerminuten deze week',
  },

  // Focus
  focus: {
    title: 'Focus sessie',
    start: 'Start focus',
    stop: 'Stop',
    complete: 'Voltooid',
    duration: '{minutes} minuten',
    xpAwarded: '+{xp} XP verdiend',
  },

  // Deadlines
  deadlines: {
    title: 'Deadlines',
    addDeadline: 'Deadline toevoegen',
    noDeadlines: 'Geen actieve deadlines',
    dueIn: 'Over {days} dagen',
    overdue: '{days} dagen te laat',
    completed: 'Voltooid',

    // Status
    onTrack: 'Op schema',
    atRisk: 'Risico',
    failed: 'Mislukt',
  },

  // Study chart
  studyChart: {
    title: 'Studie overzicht',
    thisWeek: 'Deze week',
    lastWeek: 'Vorige week',
    hours: 'uren',
    minutes: 'minuten',
  },

  // Auth
  auth: {
    signIn: 'Inloggen',
    signUp: 'Aanmelden',
    signOut: 'Uitloggen',
    email: 'E-mail',
    password: 'Wachtwoord',
    forgotPassword: 'Wachtwoord vergeten?',

    // Errors
    invalidEmail: 'Ongeldig e-mailadres',
    invalidPassword: 'Wachtwoord moet minimaal 6 tekens zijn',
    signInFailed: 'Inloggen mislukt. Controleer je gegevens.',
    signUpFailed: 'Aanmelden mislukt. Probeer het opnieuw.',
    sessionExpired: 'Je sessie is verlopen. Log opnieuw in.',
  },

  // Retention messaging
  retention: {
    // After-college ritual
    withinStudyWindow: 'Dit is je focusblok.',
    outsideStudyWindow: 'Plan je volgende focusblok.',

    // Loss aversion
    inactiveWarning: 'Je momentum zakt als je vandaag niets doet. 1 sessie is genoeg.',
    streakBroken: 'Nieuwe start. Pak vandaag 1 sessie.',

    // Variable reward
    consistencyRising: 'Je consistentie stijgt sneller dan vorige week.',
    goodProgress: 'Sterke voortgang deze week.',
    keepGoing: 'Goed bezig — houd dit vast.',
  },

  // Level up
  levelUp: {
    title: 'Level omhoog!',
    newLevel: 'Je bent nu level {level}',
    congrats: 'Gefeliciteerd!',
    continue: 'Ga verder',
  },

  // Settings
  settings: {
    title: 'Instellingen',
    language: 'Taal',
    studyWindow: 'Voorkeursvenster studietijd',
    from: 'Van',
    to: 'Tot',
    notifications: 'Notificaties',
    resetData: 'Gegevens resetten',
    confirmReset: 'Weet je zeker dat je alle gegevens wilt verwijderen?',
    pushCopy: 'Krijg een reminder op je focus-moment.',
    pushNoSpam: 'Geen spam. 1–2 per dag.',
    notificationsEnabled: 'Notificaties aan',
    notificationsDisabled: 'Notificaties uit',
  },

  system: {
    dbLocalMode: {
      title: 'Database nog niet ingesteld. Lokale modus actief.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },
} as const

// Type that represents the structure but allows any string values
export type TranslationStructure = typeof nl
