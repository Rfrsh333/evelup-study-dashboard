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
    startHere: {
      title: 'Koppel je data in 2 minuten',
      subtitle:
        'Zodra je rooster en cijfers binnen zijn, maakt LevelUp je week overzichtelijk en laat het zien wat je moet doen om te slagen.',
      progress: '{count}/2 gekoppeld',
      stepSchedule: 'Rooster importeren (ICS)',
      stepGrades: 'Cijfers importeren (PDF/CSV)',
    },
    step: {
      done: 'Voltooid',
    },
    steps: {
      valueTitle: 'Wat krijg je?',
      schedule: {
        title: 'Stap 1 — Rooster importeren',
        value: 'Je lessen/afspraken komen in Week. Je krijgt focusblok-voorstellen rond je rooster.',
        ctaImport: 'Importeer rooster (ICS)',
        ctaViewWeek: 'Bekijk Week',
      },
      grades: {
        title: 'Stap 2 — Cijfers importeren',
        value: 'Blokoverzicht (Voldaan/Open) + voorspelling/benodigd cijfer per vak.',
        tabPdf: 'PDF (aanrader)',
        tabCsv: 'CSV (alternatief)',
        ctaViewDashboard: 'Bekijk Dashboard',
      },
    },
    faq: {
      ics: {
        title: 'Hoe kom ik aan een ICS?',
        body: 'Ga naar je rooster/agenda en exporteer als .ics. Lukt het niet? Vraag je opleiding naar een ICS-link.',
      },
      grades: {
        title: 'Hoe exporteer ik cijfers?',
        body: 'Download in Brightspace de Progress Summary (PDF) of exporteer een CSV met cijfers.',
      },
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
      previewTitle: 'We vonden {count} afspraken',
      confirm: 'Importeren',
      cancel: 'Annuleren',
      errorNoVevent: 'Geen afspraken gevonden in dit bestand. BEGIN:VEVENT ontbreekt.',
      errorEmpty: 'Geen afspraken gevonden in dit bestand.',
      errorParse: 'We vonden afspraken maar konden ze niet parsen.',
      errorOutOfWindow:
        'We vonden {count} afspraken, maar ze vallen buiten je ingestelde periode (alles is al voorbij of te ver in de toekomst).',
      window: 'Periode: {start} tot {end}',
      includeRecent: 'Afgelopen 14 dagen meenemen',
      debugTotals: 'Parsed: {parsed} · Behouden: {kept} · Weggegooid: {dropped}',
      debugToggle: 'Open debugdetails',
      debugVevents: 'VEVENT aantal: {count}',
      outOfWindow:
        'We hebben {count} afspraken gevonden, maar ze vallen buiten je huidige weergave (bijv. in het verleden). Bekijk Weekoverzicht of vergroot je tijdvenster.',
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
      title: 'Database nog niet ingesteld. Lokale modus actief.',
      subtitle: 'Run supabase-schema.sql in Supabase → SQL Editor.',
    },
  },
} as const

// Type that represents the structure but allows any string values
export type TranslationStructure = typeof nl
