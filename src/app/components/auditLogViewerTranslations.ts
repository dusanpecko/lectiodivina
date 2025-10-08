export interface AuditLogViewerTranslations {
  time: {
    just_now: string;
    minutes_ago: string;
    hours_ago: string;
    yesterday: string;
    days_ago: string;
  };
  actions: {
    create: string;
    edit: string;
    delete: string;
  };
  empty_state: {
    no_activities: string;
  };
  examples: {
    recent_activities: string;
    article_activities: string;
  };
  locale: string; // For date formatting
}

export const auditLogViewerTranslations: Record<string, AuditLogViewerTranslations> = {
  sk: {
    time: {
      just_now: "pred chvíľou",
      minutes_ago: "pred ${minutes} min",
      hours_ago: "pred ${hours} h",
      yesterday: "včera",
      days_ago: "pred ${days} dňami"
    },
    actions: {
      create: "vytvorené",
      edit: "upravené", 
      delete: "zmazané"
    },
    empty_state: {
      no_activities: "Žiadne aktivity"
    },
    examples: {
      recent_activities: "Nedávne aktivity",
      article_activities: "Aktivity článkov"
    },
    locale: "sk-SK"
  },
  cz: {
    time: {
      just_now: "před chvílí",
      minutes_ago: "před ${minutes} min",
      hours_ago: "před ${hours} h",
      yesterday: "včera",
      days_ago: "před ${days} dny"
    },
    actions: {
      create: "vytvořeno",
      edit: "upraveno",
      delete: "smazáno"
    },
    empty_state: {
      no_activities: "Žádné aktivity"
    },
    examples: {
      recent_activities: "Nedávné aktivity",
      article_activities: "Aktivity článků"
    },
    locale: "cs-CZ"
  },
  en: {
    time: {
      just_now: "just now",
      minutes_ago: "${minutes} min ago",
      hours_ago: "${hours}h ago",
      yesterday: "yesterday",
      days_ago: "${days} days ago"
    },
    actions: {
      create: "created",
      edit: "edited",
      delete: "deleted"
    },
    empty_state: {
      no_activities: "No activities"
    },
    examples: {
      recent_activities: "Recent Activities",
      article_activities: "Article Activities"
    },
    locale: "en-US"
  },
  es: {
    time: {
      just_now: "hace un momento",
      minutes_ago: "hace ${minutes} min",
      hours_ago: "hace ${hours}h",
      yesterday: "ayer",
      days_ago: "hace ${days} días"
    },
    actions: {
      create: "creado",
      edit: "editado",
      delete: "eliminado"
    },
    empty_state: {
      no_activities: "Sin actividades"
    },
    examples: {
      recent_activities: "Actividades Recientes",
      article_activities: "Actividades de Artículos"
    },
    locale: "es-ES"
  }
};