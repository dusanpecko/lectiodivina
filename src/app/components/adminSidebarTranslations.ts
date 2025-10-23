export interface AdminSidebarTranslations {
  header: {
    title: string;
    subtitle: string;
  };
  navigation: {
    tasks: string;
    lectio_sources: string;
    liturgical_calendar: string;
    rosary: string;
    launch_checklist: string;
    error_reports: string;
    programs: string;
    notifications: string;
    notification_topics: string;
    bible_bulk_import: string;
  };
  states: {
    loading: string;
  };
  quick_actions: {
    title: string;
    button_title: string;
    new_article: string;
    new_lectio_source: string;
    notifications: string;
  };
}

export const adminSidebarTranslations: Record<string, AdminSidebarTranslations> = {
  sk: {
    header: {
      title: "Admin Panel",
      subtitle: "Správa obsahu"
    },
    navigation: {
      tasks: "Úlohy",
      lectio_sources: "Lectio Zdroje",
      liturgical_calendar: "Liturgický kalendár",
      rosary: "Ruženec",
      launch_checklist: "Launch Checklist",
      error_reports: "Správa chýb",
      programs: "Programy",
      notifications: "Notifikácie",
      notification_topics: "Témy notifikácií",
      bible_bulk_import: "Bible Import"
    },
    states: {
      loading: "Načítava..."
    },
    quick_actions: {
      title: "Rýchle akcie",
      button_title: "Rýchle akcie",
      new_article: "Nový článok",
      new_lectio_source: "Nový Lectio zdroj",
      notifications: "Notifikácie"
    }
  },
  cz: {
    header: {
      title: "Admin Panel",
      subtitle: "Správa obsahu"
    },
    navigation: {
      tasks: "Úkoly",
      lectio_sources: "Lectio Zdroje",
      liturgical_calendar: "Liturgický kalendář",
      rosary: "Růženec",
      launch_checklist: "Launch Checklist",
      error_reports: "Zpráva chyb",
      programs: "Programy",
      notifications: "Oznámení",
      notification_topics: "Témata oznámení",
      bible_bulk_import: "Bible Import"
    },
    states: {
      loading: "Načítá..."
    },
    quick_actions: {
      title: "Rychlé akce",
      button_title: "Rychlé akce",
      new_article: "Nový článek",
      new_lectio_source: "Nový Lectio zdroj",
      notifications: "Oznámení"
    }
  },
  en: {
    header: {
      title: "Admin Panel",
      subtitle: "Content Management"
    },
    navigation: {
      tasks: "Tasks",
      lectio_sources: "Lectio Sources",
      liturgical_calendar: "Liturgical Calendar",
      rosary: "Rosary",
      launch_checklist: "Launch Checklist",
      error_reports: "Error Reports",
      programs: "Programs",
      notifications: "Notifications",
      notification_topics: "Notification Topics",
      bible_bulk_import: "Bible Import"
    },
    states: {
      loading: "Loading..."
    },
    quick_actions: {
      title: "Quick Actions",
      button_title: "Quick Actions",
      new_article: "New Article",
      new_lectio_source: "New Lectio Source",
      notifications: "Notifications"
    }
  },
  es: {
    header: {
      title: "Panel Admin",
      subtitle: "Gestión de Contenido"
    },
    navigation: {
      tasks: "Tareas",
      lectio_sources: "Fuentes Lectio",
      liturgical_calendar: "Calendario Litúrgico",
      rosary: "Rosario",
      launch_checklist: "Launch Checklist",
      error_reports: "Reportes de Error",
      programs: "Programas",
      notifications: "Notificaciones",
      notification_topics: "Temas de Notificaciones",
      bible_bulk_import: "Importar Biblia"
    },
    states: {
      loading: "Cargando..."
    },
    quick_actions: {
      title: "Acciones Rápidas",
      button_title: "Acciones Rápidas",
      new_article: "Nuevo Artículo",
      new_lectio_source: "Nueva Fuente Lectio",
      notifications: "Notificaciones"
    }
  }
};