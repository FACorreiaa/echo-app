/**
 * i18n - Internationalization setup using expo-localization
 *
 * This module detects the device's locale and provides translations.
 * Supports: English, Portuguese, German, French, Spanish, Russian
 */

import * as Localization from "expo-localization";

// Type for supported locales
export type SupportedLocale = "en" | "pt" | "de" | "fr" | "es" | "ru";

// Translation interface
export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    done: string;
    back: string;
    next: string;
    confirm: string;
    search: string;
    noResults: string;
  };
  // Tabs
  tabs: {
    home: string;
    planning: string;
    transactions: string;
    goals: string;
    settings: string;
  };
  // Planning
  planning: {
    createPlan: string;
    importExcel: string;
    categories: string;
    budget: string;
    recurring: string;
    savings: string;
    income: string;
    debt: string;
    total: string;
    remaining: string;
    spent: string;
  };
  // Auth
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    forgotPassword: string;
  };
  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    currency: string;
    about: string;
  };
}

// English translations (default)
const en: Translations = {
  common: {
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    back: "Back",
    next: "Next",
    confirm: "Confirm",
    search: "Search",
    noResults: "No results found",
  },
  tabs: {
    home: "Home",
    planning: "Planning",
    transactions: "Transactions",
    goals: "Goals",
    settings: "Settings",
  },
  planning: {
    createPlan: "Create Plan",
    importExcel: "Import from Excel",
    categories: "Categories",
    budget: "Budget",
    recurring: "Recurring",
    savings: "Savings",
    income: "Income",
    debt: "Debt",
    total: "Total",
    remaining: "Remaining",
    spent: "Spent",
  },
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    currency: "Currency",
    about: "About",
  },
};

// Portuguese translations
const pt: Translations = {
  common: {
    loading: "Carregando...",
    error: "Ocorreu um erro",
    retry: "Tentar novamente",
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    edit: "Editar",
    done: "Concluído",
    back: "Voltar",
    next: "Próximo",
    confirm: "Confirmar",
    search: "Pesquisar",
    noResults: "Nenhum resultado encontrado",
  },
  tabs: {
    home: "Início",
    planning: "Planejamento",
    transactions: "Transações",
    goals: "Metas",
    settings: "Configurações",
  },
  planning: {
    createPlan: "Criar Plano",
    importExcel: "Importar do Excel",
    categories: "Categorias",
    budget: "Orçamento",
    recurring: "Recorrente",
    savings: "Poupança",
    income: "Receita",
    debt: "Dívidas",
    total: "Total",
    remaining: "Restante",
    spent: "Gasto",
  },
  auth: {
    login: "Entrar",
    logout: "Sair",
    register: "Cadastrar",
    email: "E-mail",
    password: "Senha",
    forgotPassword: "Esqueceu a senha?",
  },
  settings: {
    title: "Configurações",
    language: "Idioma",
    theme: "Tema",
    notifications: "Notificações",
    currency: "Moeda",
    about: "Sobre",
  },
};

// German translations
const de: Translations = {
  common: {
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten",
    retry: "Erneut versuchen",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    done: "Fertig",
    back: "Zurück",
    next: "Weiter",
    confirm: "Bestätigen",
    search: "Suchen",
    noResults: "Keine Ergebnisse gefunden",
  },
  tabs: {
    home: "Start",
    planning: "Planung",
    transactions: "Transaktionen",
    goals: "Ziele",
    settings: "Einstellungen",
  },
  planning: {
    createPlan: "Plan erstellen",
    importExcel: "Aus Excel importieren",
    categories: "Kategorien",
    budget: "Budget",
    recurring: "Wiederkehrend",
    savings: "Sparen",
    income: "Einkommen",
    debt: "Schulden",
    total: "Gesamt",
    remaining: "Verbleibend",
    spent: "Ausgegeben",
  },
  auth: {
    login: "Anmelden",
    logout: "Abmelden",
    register: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    forgotPassword: "Passwort vergessen?",
  },
  settings: {
    title: "Einstellungen",
    language: "Sprache",
    theme: "Design",
    notifications: "Benachrichtigungen",
    currency: "Währung",
    about: "Über",
  },
};

// French translations
const fr: Translations = {
  common: {
    loading: "Chargement...",
    error: "Une erreur est survenue",
    retry: "Réessayer",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    done: "Terminé",
    back: "Retour",
    next: "Suivant",
    confirm: "Confirmer",
    search: "Rechercher",
    noResults: "Aucun résultat trouvé",
  },
  tabs: {
    home: "Accueil",
    planning: "Planification",
    transactions: "Transactions",
    goals: "Objectifs",
    settings: "Paramètres",
  },
  planning: {
    createPlan: "Créer un plan",
    importExcel: "Importer depuis Excel",
    categories: "Catégories",
    budget: "Budget",
    recurring: "Récurrent",
    savings: "Épargne",
    income: "Revenus",
    debt: "Dettes",
    total: "Total",
    remaining: "Restant",
    spent: "Dépensé",
  },
  auth: {
    login: "Connexion",
    logout: "Déconnexion",
    register: "Inscription",
    email: "E-mail",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
  },
  settings: {
    title: "Paramètres",
    language: "Langue",
    theme: "Thème",
    notifications: "Notifications",
    currency: "Devise",
    about: "À propos",
  },
};

// Spanish translations
const es: Translations = {
  common: {
    loading: "Cargando...",
    error: "Ha ocurrido un error",
    retry: "Reintentar",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    done: "Hecho",
    back: "Atrás",
    next: "Siguiente",
    confirm: "Confirmar",
    search: "Buscar",
    noResults: "Sin resultados",
  },
  tabs: {
    home: "Inicio",
    planning: "Planificación",
    transactions: "Transacciones",
    goals: "Metas",
    settings: "Ajustes",
  },
  planning: {
    createPlan: "Crear plan",
    importExcel: "Importar desde Excel",
    categories: "Categorías",
    budget: "Presupuesto",
    recurring: "Recurrente",
    savings: "Ahorro",
    income: "Ingresos",
    debt: "Deudas",
    total: "Total",
    remaining: "Restante",
    spent: "Gastado",
  },
  auth: {
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    register: "Registrarse",
    email: "Correo",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
  },
  settings: {
    title: "Ajustes",
    language: "Idioma",
    theme: "Tema",
    notifications: "Notificaciones",
    currency: "Moneda",
    about: "Acerca de",
  },
};

// Russian translations
const ru: Translations = {
  common: {
    loading: "Загрузка...",
    error: "Произошла ошибка",
    retry: "Повторить",
    cancel: "Отмена",
    save: "Сохранить",
    delete: "Удалить",
    edit: "Изменить",
    done: "Готово",
    back: "Назад",
    next: "Далее",
    confirm: "Подтвердить",
    search: "Поиск",
    noResults: "Ничего не найдено",
  },
  tabs: {
    home: "Главная",
    planning: "Планирование",
    transactions: "Транзакции",
    goals: "Цели",
    settings: "Настройки",
  },
  planning: {
    createPlan: "Создать план",
    importExcel: "Импорт из Excel",
    categories: "Категории",
    budget: "Бюджет",
    recurring: "Регулярные",
    savings: "Сбережения",
    income: "Доходы",
    debt: "Долги",
    total: "Итого",
    remaining: "Остаток",
    spent: "Потрачено",
  },
  auth: {
    login: "Войти",
    logout: "Выйти",
    register: "Регистрация",
    email: "Эл. почта",
    password: "Пароль",
    forgotPassword: "Забыли пароль?",
  },
  settings: {
    title: "Настройки",
    language: "Язык",
    theme: "Тема",
    notifications: "Уведомления",
    currency: "Валюта",
    about: "О приложении",
  },
};

// All translations
const translations: Record<SupportedLocale, Translations> = {
  en,
  pt,
  de,
  fr,
  es,
  ru,
};

// Get device locale
function getDeviceLocale(): SupportedLocale {
  const locales = Localization.getLocales();
  if (locales.length === 0) return "en";

  const deviceLang = locales[0].languageCode?.toLowerCase() ?? "en";

  // Check if we support this locale
  if (deviceLang in translations) {
    return deviceLang as SupportedLocale;
  }

  // Fallback to English
  return "en";
}

// Current locale (detected from device)
let currentLocale: SupportedLocale = getDeviceLocale();

// Get translations for current locale
export function t(): Translations {
  return translations[currentLocale];
}

// Get current locale code
export function getLocale(): SupportedLocale {
  return currentLocale;
}

// Set locale manually (for settings override)
export function setLocale(locale: SupportedLocale): void {
  currentLocale = locale;
}

// Get all supported locales with labels
export function getSupportedLocales(): Array<{ code: SupportedLocale; label: string }> {
  return [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
  ];
}

// Get device's region/country code
export function getDeviceRegion(): string {
  const locales = Localization.getLocales();
  if (locales.length === 0) return "US";
  return locales[0].regionCode ?? "US";
}

// Get device's currency code based on region
export function getDeviceCurrency(): string {
  const region = getDeviceRegion();
  const currencyMap: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    DE: "EUR",
    FR: "EUR",
    ES: "EUR",
    PT: "EUR",
    BR: "BRL",
    RU: "RUB",
    JP: "JPY",
    CN: "CNY",
  };
  return currencyMap[region] ?? "USD";
}

// Export default for convenience
export default {
  t,
  getLocale,
  setLocale,
  getSupportedLocales,
  getDeviceRegion,
  getDeviceCurrency,
};
