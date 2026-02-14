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
    focusWindow: 'Voorkeursfocusblok',
    focusMinutes: 'Focusduur (min)',
  },

  integrations: {
    header: 'Koppelingen',
    explainer: 'Brightspace synchroniseert deadlines en cijfers. Agenda-import voegt deadlines toe.',
    onboarding: {
      title: 'Brightspace import (beta)',
      subtitle: 'Importeer deadlines (ICS) en cijfers (CSV) in twee snelle stappen.',
      step: 'Stap {step}',
    },
    brightspace: {
      title: 'Brightspace',
      description: 'Brightspace koppeling via schoollicentie.',
      connect: 'Vraag jouw opleiding om LevelUp te activeren',
      note: 'OAuth loopt via de server; je wachtwoord blijft bij Brightspace.',
    },
    calendar: {
      title: 'Agenda import',
      description: 'Importeer deadlines uit je agenda (.ics) in LevelUp.',
      import: 'Importeer agenda',
      refreshNote: 'Tip: voeg een ICS-URL toe om snel te refreshen.',
      imported: '{count} items geïmporteerd',
      urlPlaceholder: 'Plak je ICS-URL (optioneel)',
      refresh: 'Vernieuwen',
      refreshing: 'Bezig…',
      refreshError: 'ICS-feed kon niet worden opgehaald (CORS of netwerkfout).',
      refreshErrorTitle: 'Agenda-URL geblokkeerd',
      refreshSuccess: 'Agenda vernieuwd',
      uploadCta: 'Upload .ics bestand',
      needsManual: 'Handmatige upload nodig. Laat de URL staan en upload een bestand.',
    },
    csv: {
      title: 'Cijfers CSV',
      description: 'Importeer je Brightspace-cijfers via een CSV-export.',
      upload: 'Upload CSV',
      import: 'Importeer cijfers',
      preview: 'Preview import',
      previewTitle: 'Voorbeeld',
      previewStats: '{rows} rijen · {courses} vakken',
      previewSummary: 'Voorbeeld: {course} · verwacht {predicted} · nodig {required}',
      confirm: 'Import bevestigen',
      back: 'Terug',
      rows: '{count} rijen gevonden',
      waiting: 'Wachten op CSV',
      imported: '{count} cijfers geïmporteerd',
      pastePlaceholder: 'Plak CSV hier…',
      blockLabel: 'Blok label',
      parseError: 'CSV kon niet worden gelezen. Controleer het formaat.',
      mapping: {
        course: 'Vak-kolom',
        item: 'Item-kolom',
        score: 'Cijfer-kolom',
        weight: 'Weging-kolom',
        date: 'Datum-kolom',
        status: 'Status-kolom',
        block: 'Blok-kolom',
        optional: 'Optioneel',
      },
    },
    pdf: {
      title: 'Progress Summary PDF',
      description: 'Upload de Brightspace Progress Summary PDF om competenties te importeren.',
      upload: 'Upload PDF',
      analyze: 'Analyseer PDF',
      analyzing: 'Bezig…',
      found: '{total} onderdelen gevonden ({passed} voldaan, {pending} open)',
      confirm: 'Import bevestigen',
      back: 'Terug',
      remove: 'Verwijderen',
      blockLabel: 'Blok label',
      parseError: 'PDF kon niet worden gelezen. Exporteer opnieuw.',
      empty: 'Geen onderdelen gevonden in deze PDF.',
      warning: 'Sommige onderdelen konden niet worden herkend. Controleer de lijst hieronder.',
      imported: '{count} onderdelen geïmporteerd',
    },
    lti: {
      title: 'Schoolkoppeling (LTI)',
      description: 'Voor schoollicenties. Vereist installatie door je instelling.',
      comingSoon: 'Binnenkort beschikbaar',
    },
    status: {
      connected: 'Verbonden',
      disconnected: 'Niet verbonden',
      localMode: 'Lokale modus',
    },
    ltiRequested: 'We nemen contact op met jouw opleiding.',
  },

  insights: {
    dauTitle: 'DAU (laatste 14 dagen)',
    d1Title: 'D1 retentie',
    d1Subtitle: 'Laatste 14 cohorts',
    w1Title: 'W1 retentie',
    w1Subtitle: 'Laatste 8 cohorts',
    adminOnly: 'Insights zijn alleen voor admins.',
  },

  grades: {
    title: 'Cijfers',
    predicted: 'Verwacht eindcijfer',
    required: 'Benodigde gemiddelde',
    placeholder: 'Verbind Brightspace om voorspellingen te zien.',
    empty: 'Geen cijfers gevonden.',
    cta: 'Koppel Brightspace',
  },

  blockProgress: {
    title: 'Blok voortgang',
    blockLabel: 'Blok {block}',
    noBlock: 'Geen blok geselecteerd',
    summary: '{passed}/{total} onderdelen voldaan',
    subtitle: '{pending} open · {failed} niet voldaan · {percent}% voldaan',
    empty: 'Nog geen blokvoortgang.',
    cta: 'Importeer Brightspace progress (CSV/PDF)',
    viewAll: 'Bekijk blokoverzicht',
    status: {
      passed: 'Voldaan',
      failed: 'Niet voldaan',
      pending: 'Open',
    },
  },

  blockOverview: {
    title: 'Blokoverzicht',
    empty: 'Nog geen blokdata.',
  },

  today: {
    school: {
      title: 'School: Prioriteiten',
      cta: 'Ga naar Deadlines overzicht',
      empty: 'Geen urgente schooldeadlines binnen 72u.',
    },
    personal: {
      title: 'Persoonlijk: Planning vandaag',
      cta: 'Importeer agenda',
      empty: 'Geen persoonlijke events vandaag.',
    },
    focusSuggestion: {
      title: 'Focusblok voorstel',
      body: 'Je hebt een vrij blok om {time}. Plan {minutes} min focus.',
      reason: {
        preferred: 'Past in je ritme (na college).',
        deadline: 'Voor je eerstvolgende deadline.',
        gap: 'Grootste vrije blok vandaag.',
      },
      cta: {
        schedule: 'Plan focusblok',
        otherTime: 'Andere tijd',
      },
      empty: 'Geen vrij blok gevonden. Plan handmatig.',
      focusTitle: 'Focusblok ({minutes} min)',
    },
  },

  week: {
    filter: {
      school: 'School',
      personal: 'Persoonlijk',
    },
    schoolTitle: 'Schooldeadlines',
    personalTitle: 'Persoonlijke events',
    emptySchool: 'Nog geen schooldeadlines.',
    emptyPersonal: 'Nog geen persoonlijke events.',
    tag: {
      school: 'School',
      personal: 'Persoonlijk',
    },
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
