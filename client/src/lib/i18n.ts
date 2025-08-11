import { useState, useEffect } from 'react';

export type Language = 'uk' | 'en';

interface TranslationKeys {
  // Navigation & Common
  'nav.home': string;
  'nav.creator': string;
  'nav.dashboard': string;
  'nav.events': string;
  'nav.locations': string;
  'nav.login': string;
  'nav.register': string;
  'nav.logout': string;
  'nav.admin': string;
  'common.loading': string;
  'common.save': string;
  'common.cancel': string;
  'common.close': string;
  'common.next': string;
  'common.previous': string;
  'common.submit': string;
  'common.edit': string;
  'common.delete': string;
  'common.create': string;
  
  // Landing Page
  'landing.title': string;
  'landing.subtitle': string;
  'landing.cta': string;
  'landing.features.title': string;
  'landing.features.ai.title': string;
  'landing.features.ai.description': string;
  'landing.features.templates.title': string;
  'landing.features.templates.description': string;
  'landing.features.social.title': string;
  'landing.features.social.description': string;
  
  // Postcard Creator
  'creator.title': string;
  'creator.selectTemplate': string;
  'creator.customizePostcard': string;
  'creator.postcardTitle': string;
  'creator.postcardMessage': string;
  'creator.fontFamily': string;
  'creator.backgroundColor': string;
  'creator.textColor': string;
  'creator.download': string;
  'creator.share': string;
  'creator.orderPrint': string;
  'creator.emailPrompt.title': string;
  'creator.emailPrompt.description': string;
  'creator.emailPrompt.skip': string;
  'creator.emailPrompt.create': string;
  
  // AI Recommendations
  'ai.title': string;
  'ai.description': string;
  'ai.completeOnboarding': string;
  'ai.refresh': string;
  'ai.createPostcard': string;
  'ai.whyRecommended': string;
  'ai.bestTime': string;
  'ai.nearbyAttractions': string;
  'ai.photoTips': string;
  'ai.historicalSignificance': string;
  'ai.categories.all': string;
  'ai.categories.architecture': string;
  'ai.categories.culture': string;
  'ai.categories.history': string;
  'ai.categories.nature': string;
  'ai.categories.entertainment': string;
  
  // Authentication
  'auth.login': string;
  'auth.register': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.firstName': string;
  'auth.lastName': string;
  'auth.forgotPassword': string;
  'auth.resetPassword': string;
  'auth.loginSuccess': string;
  'auth.registerSuccess': string;
  'auth.loginError': string;
  'auth.registerError': string;
  
  // Onboarding
  'onboarding.welcome': string;
  'onboarding.step1.title': string;
  'onboarding.step1.description': string;
  'onboarding.step2.title': string;
  'onboarding.step2.description': string;
  'onboarding.step3.title': string;
  'onboarding.step3.description': string;
  'onboarding.interests': string;
  'onboarding.travelStyle': string;
  'onboarding.timeOfYear': string;
  'onboarding.complete': string;
  
  // Subscription
  'subscription.title': string;
  'subscription.basic': string;
  'subscription.premium': string;
  'subscription.family': string;
  'subscription.monthly': string;
  'subscription.yearly': string;
  'subscription.subscribe': string;
  
  // Messages & Notifications
  'message.postcardCreated': string;
  'message.postcardSaved': string;
  'message.downloadComplete': string;
  'message.shareSuccess': string;
  'message.error.generic': string;
  'message.error.network': string;
  'message.unauthorized': string;
}

const translations: Record<Language, TranslationKeys> = {
  uk: {
    // Navigation & Common
    'nav.home': 'Головна',
    'nav.creator': 'Створити листівку',
    'nav.dashboard': 'Панель',
    'nav.events': 'Події',
    'nav.locations': 'Локації',
    'nav.login': 'Увійти',
    'nav.register': 'Реєстрація',
    'nav.logout': 'Вийти',
    'nav.admin': 'Адмін',
    'common.loading': 'Завантаження...',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.close': 'Закрити',
    'common.next': 'Далі',
    'common.previous': 'Назад',
    'common.submit': 'Відправити',
    'common.edit': 'Редагувати',
    'common.delete': 'Видалити',
    'common.create': 'Створити',
    
    // Landing Page
    'landing.title': 'Цифрові листівки з Одеси',
    'landing.subtitle': 'Створюйте персоналізовані листівки з найкращими місцями Одеси',
    'landing.cta': 'Почати створювати',
    'landing.features.title': 'Особливості',
    'landing.features.ai.title': 'ШІ рекомендації',
    'landing.features.ai.description': 'Персоналізовані пропозиції пам\'яток на основі ваших інтересів',
    'landing.features.templates.title': 'Красиві шаблони',
    'landing.features.templates.description': 'Професійні дизайни з видами Одеси',
    'landing.features.social.title': 'Соціальні мережі',
    'landing.features.social.description': 'Миттєве поширення в соцмережах',
    
    // Postcard Creator
    'creator.title': 'Створити листівку',
    'creator.selectTemplate': 'Оберіть шаблон',
    'creator.customizePostcard': 'Налаштуйте листівку',
    'creator.postcardTitle': 'Заголовок листівки',
    'creator.postcardMessage': 'Повідомлення',
    'creator.fontFamily': 'Шрифт',
    'creator.backgroundColor': 'Колір фону',
    'creator.textColor': 'Колір тексту',
    'creator.download': 'Завантажити',
    'creator.share': 'Поділитися',
    'creator.orderPrint': 'Замовити друк',
    'creator.emailPrompt.title': 'Майже готово!',
    'creator.emailPrompt.description': 'Введіть email для створення безкоштовної цифрової листівки',
    'creator.emailPrompt.skip': 'Пропустити',
    'creator.emailPrompt.create': 'Створити листівку',
    
    // AI Recommendations
    'ai.title': 'ШІ рекомендації',
    'ai.description': 'Персоналізовані пропозиції пам\'яток',
    'ai.completeOnboarding': 'Завершити налаштування',
    'ai.refresh': 'Оновити',
    'ai.createPostcard': 'Створити листівку',
    'ai.whyRecommended': 'Чому це підходить вам:',
    'ai.bestTime': 'Кращий час:',
    'ai.nearbyAttractions': 'Поблизу:',
    'ai.photoTips': 'Поради для фото:',
    'ai.historicalSignificance': 'Історичне значення:',
    'ai.categories.all': 'Всі',
    'ai.categories.architecture': 'Архітектура',
    'ai.categories.culture': 'Культура',
    'ai.categories.history': 'Історія',
    'ai.categories.nature': 'Природа',
    'ai.categories.entertainment': 'Розваги',
    
    // Authentication
    'auth.login': 'Увійти',
    'auth.register': 'Зареєструватися',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Підтвердіть пароль',
    'auth.firstName': 'Ім\'я',
    'auth.lastName': 'Прізвище',
    'auth.forgotPassword': 'Забули пароль?',
    'auth.resetPassword': 'Скинути пароль',
    'auth.loginSuccess': 'Успішно увійшли',
    'auth.registerSuccess': 'Реєстрація успішна',
    'auth.loginError': 'Помилка входу',
    'auth.registerError': 'Помилка реєстрації',
    
    // Onboarding
    'onboarding.welcome': 'Ласкаво просимо!',
    'onboarding.step1.title': 'Розкажіть про ваші інтереси',
    'onboarding.step1.description': 'Допоможіть нам зрозуміти, що вам подобається',
    'onboarding.step2.title': 'Ваш стиль подорожей',
    'onboarding.step2.description': 'Як ви любите досліджувати нові місця?',
    'onboarding.step3.title': 'Коли ви плануєте візит?',
    'onboarding.step3.description': 'Різні пори року пропонують різні враження',
    'onboarding.interests': 'Інтереси',
    'onboarding.travelStyle': 'Стиль подорожей',
    'onboarding.timeOfYear': 'Час року',
    'onboarding.complete': 'Завершити',
    
    // Subscription
    'subscription.title': 'Оберіть план',
    'subscription.basic': 'Базовий',
    'subscription.premium': 'Преміум',
    'subscription.family': 'Сімейний',
    'subscription.monthly': 'Щомісяця',
    'subscription.yearly': 'Щорічно',
    'subscription.subscribe': 'Підписатися',
    
    // Messages & Notifications
    'message.postcardCreated': 'Листівка створена успішно!',
    'message.postcardSaved': 'Листівка збережена',
    'message.downloadComplete': 'Завантаження завершено',
    'message.shareSuccess': 'Успішно поділилися',
    'message.error.generic': 'Сталася помилка',
    'message.error.network': 'Помилка мережі',
    'message.unauthorized': 'Ви вийшли з системи. Входимо знову...',
  },
  en: {
    // Navigation & Common
    'nav.home': 'Home',
    'nav.creator': 'Create Postcard',
    'nav.dashboard': 'Dashboard',
    'nav.events': 'Events',
    'nav.locations': 'Locations',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    
    // Landing Page
    'landing.title': 'Digital Postcards from Odesa',
    'landing.subtitle': 'Create personalized postcards featuring Odesa\'s most beautiful locations',
    'landing.cta': 'Start Creating',
    'landing.features.title': 'Features',
    'landing.features.ai.title': 'AI Recommendations',
    'landing.features.ai.description': 'Personalized landmark suggestions based on your interests',
    'landing.features.templates.title': 'Beautiful Templates',
    'landing.features.templates.description': 'Professional designs featuring Odesa\'s views',
    'landing.features.social.title': 'Social Sharing',
    'landing.features.social.description': 'Instant sharing to social media',
    
    // Postcard Creator
    'creator.title': 'Create Postcard',
    'creator.selectTemplate': 'Select a Template',
    'creator.customizePostcard': 'Customize Your Postcard',
    'creator.postcardTitle': 'Postcard Title',
    'creator.postcardMessage': 'Message',
    'creator.fontFamily': 'Font',
    'creator.backgroundColor': 'Background Color',
    'creator.textColor': 'Text Color',
    'creator.download': 'Download',
    'creator.share': 'Share',
    'creator.orderPrint': 'Order Print',
    'creator.emailPrompt.title': 'Almost Ready!',
    'creator.emailPrompt.description': 'Enter your email to create your free digital postcard',
    'creator.emailPrompt.skip': 'Skip for Now',
    'creator.emailPrompt.create': 'Create Postcard',
    
    // AI Recommendations
    'ai.title': 'AI Recommendations',
    'ai.description': 'Personalized landmark suggestions',
    'ai.completeOnboarding': 'Complete Setup',
    'ai.refresh': 'Refresh',
    'ai.createPostcard': 'Create Postcard',
    'ai.whyRecommended': 'Why this matches you:',
    'ai.bestTime': 'Best Time:',
    'ai.nearbyAttractions': 'Nearby:',
    'ai.photoTips': 'Photo Tips:',
    'ai.historicalSignificance': 'Historical Significance:',
    'ai.categories.all': 'All',
    'ai.categories.architecture': 'Architecture',
    'ai.categories.culture': 'Culture',
    'ai.categories.history': 'History',
    'ai.categories.nature': 'Nature',
    'ai.categories.entertainment': 'Entertainment',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.loginSuccess': 'Successfully logged in',
    'auth.registerSuccess': 'Registration successful',
    'auth.loginError': 'Login error',
    'auth.registerError': 'Registration error',
    
    // Onboarding
    'onboarding.welcome': 'Welcome!',
    'onboarding.step1.title': 'Tell us about your interests',
    'onboarding.step1.description': 'Help us understand what you enjoy',
    'onboarding.step2.title': 'Your travel style',
    'onboarding.step2.description': 'How do you like to explore new places?',
    'onboarding.step3.title': 'When are you planning to visit?',
    'onboarding.step3.description': 'Different seasons offer different experiences',
    'onboarding.interests': 'Interests',
    'onboarding.travelStyle': 'Travel Style',
    'onboarding.timeOfYear': 'Time of Year',
    'onboarding.complete': 'Complete',
    
    // Subscription
    'subscription.title': 'Choose Your Plan',
    'subscription.basic': 'Basic',
    'subscription.premium': 'Premium',
    'subscription.family': 'Family',
    'subscription.monthly': 'Monthly',
    'subscription.yearly': 'Yearly',
    'subscription.subscribe': 'Subscribe',
    
    // Messages & Notifications
    'message.postcardCreated': 'Postcard created successfully!',
    'message.postcardSaved': 'Postcard saved',
    'message.downloadComplete': 'Download complete',
    'message.shareSuccess': 'Successfully shared',
    'message.error.generic': 'An error occurred',
    'message.error.network': 'Network error',
    'message.unauthorized': 'You are logged out. Logging in again...',
  }
};

// Browser language detection
const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'uk';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for Ukrainian
  if (browserLang.startsWith('uk')) return 'uk';
  
  // Default to Ukrainian
  return 'uk';
};

// Language management
export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'uk';
    
    // Check localStorage first
    const stored = localStorage.getItem('odesa-language') as Language;
    if (stored && (stored === 'uk' || stored === 'en')) {
      return stored;
    }
    
    // Fall back to browser detection
    return getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('odesa-language', language);
  }, [language]);

  const t = (key: keyof TranslationKeys): string => {
    return translations[language][key] || key;
  };

  const switchLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    switchLanguage,
    isUkrainian: language === 'uk',
    isEnglish: language === 'en'
  };
};

export default translations;