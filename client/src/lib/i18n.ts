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

  // Home Page
  'home.hero.subtitle': string;
  'home.hero.createButton': string;
  'home.hero.watchDemo': string;
  'home.features.title': string;
  'home.features.subtitle': string;
  'home.features.templates.title': string;
  'home.features.templates.description': string;
  'home.features.customization.title': string;
  'home.features.customization.description': string;
  'home.features.sharing.title': string;
  'home.features.sharing.description': string;
  'home.features.printing.title': string;
  'home.features.printing.description': string;
  'home.templates.title': string;
  'home.templates.subtitle': string;
  'home.templates.viewAll': string;
  'home.pricing.title': string;
  'home.pricing.subtitle': string;
  'home.pricing.free.description': string;
  'home.pricing.print.description': string;
  'home.pricing.premium.description': string;
  'home.pricing.getStarted': string;
  'home.pricing.orderPrint': string;
  'home.pricing.upgrade': string;
  'home.pricing.bulk': string;
  'home.pricing.contact': string;
  'home.gallery.title': string;
  'home.gallery.subtitle': string;
  'home.stats.postcards': string;
  'home.stats.rating': string;
  'home.stats.countries': string;
  'home.footer.about.title': string;
  'home.footer.about.description': string;
  'home.footer.links.title': string;
  'home.footer.support.title': string;
  'home.footer.social.title': string;
  'home.footer.copyright': string;

  // Dashboard
  'dashboard.welcome': string;
  'dashboard.stats.postcards': string;
  'dashboard.stats.orders': string;
  'dashboard.stats.stories': string;
  'dashboard.quickActions': string;
  'dashboard.recentActivity': string;
  'dashboard.popularTemplates': string;
  'dashboard.viewAll': string;
  'dashboard.noActivity': string;

  // Story Creator
  'story.title': string;
  'story.selectPreferences': string;
  'story.location': string;
  'story.mood': string;
  'story.length': string;
  'story.generate': string;
  'story.save': string;
  'story.share': string;
  'story.instagram': string;
  'story.facebook': string;
  'story.twitter': string;
  'story.saving': string;
  'story.generating': string;
  'story.saved': string;
  'story.shareSuccess': string;
  'story.error': string;

  // Navigation
  'nav.templates': string;
  'nav.pricing': string;
  'nav.gallery': string;
  'nav.stories': string;
  'nav.subscription': string;

  // Forms & Inputs
  'form.email.placeholder': string;
  'form.password.placeholder': string;
  'form.confirmPassword.placeholder': string;
  'form.firstName.placeholder': string;
  'form.lastName.placeholder': string;
  'form.required': string;
  'form.invalid': string;

  // Subscription Plans
  'plan.digitalFree': string;
  'plan.printShip': string;
  'plan.premiumAccess': string;
  'plan.monthly': string;
  'plan.features.digitalCards': string;
  'plan.features.aiStories': string;
  'plan.features.templates': string;
  'plan.features.exports': string;
  'plan.features.unlimited': string;
  'plan.features.freeShip': string;
  'plan.features.noWatermarks': string;
  'plan.features.premium': string;
  'plan.features.support': string;
  'plan.features.shipping': string;
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

    // Home Page
    'home.hero.subtitle': 'Створюйте персоналізовані цифрові листівки з мальовничими краєвидами Одеси та діліться спогадами з усім світом.',
    'home.hero.createButton': 'Створити безкоштовну листівку',
    'home.hero.watchDemo': 'Переглянути демо',
    'home.features.title': 'Все необхідне для створення чудових листівок',
    'home.features.subtitle': 'Від безкоштовного цифрового створення до преміального друку, ми покриваємо всі ваші потреби в листівках.',
    'home.features.templates.title': 'Преміальні шаблони',
    'home.features.templates.description': 'Красиві, професійно розроблені шаблони з найбільш знаковими пам\'ятками та краєвидами Одеси.',
    'home.features.customization.title': 'Легке налаштування',
    'home.features.customization.description': 'Додайте свої фотографії, налаштуйте текст, виберіть шрифти та персоналізуйте кожну деталь з нашим інтуїтивним редактором.',
    'home.features.sharing.title': 'Соціальний обмін',
    'home.features.sharing.description': 'Миттєво діліться в Instagram, Facebook, Twitter або надсилайте електронною поштою друзям та родині по всьому світу.',
    'home.features.printing.title': 'Друк і доставка',
    'home.features.printing.description': 'Замовляйте високоякісні друковані листівки з доставкою в будь-яку точку світу. Ідеально підходить для традиційної пошти.',
    'home.templates.title': 'Відкрийте красу Одеси',
    'home.templates.subtitle': 'Вибирайте з нашої кураторської колекції приголомшливих пам\'яток Одеси та прибережних краєвидів.',
    'home.templates.viewAll': 'Переглянути всі шаблони',
    'home.pricing.title': 'Прості, прозорі ціни',
    'home.pricing.subtitle': 'Починайте безкоштовно, оновлюйтесь, коли будете готові до друку та доставки.',
    'home.pricing.free.description': 'Ідеально для цифрових листівок',
    'home.pricing.print.description': 'Цифрові плюс фізичні листівки з AI історіями',
    'home.pricing.premium.description': 'Повний доступ з преміальними функціями та необмеженим AI',
    'home.pricing.getStarted': 'Почати безкоштовно',
    'home.pricing.orderPrint': 'Замовити друковану листівку',
    'home.pricing.upgrade': 'Оновитись до преміум',
    'home.pricing.bulk': 'Потрібні оптові замовлення для вашого бізнесу чи заходу?',
    'home.pricing.contact': 'Зв\'яжіться з нами для індивідуального ціноутворення',
    'home.gallery.title': 'Створено мандрівниками, такими як ви',
    'home.gallery.subtitle': 'Приєднуйтесь до тисяч щасливих туристів, які діляться своїми спогадами про Одесу.',
    'home.stats.postcards': 'створених листівок',
    'home.stats.rating': 'рейтинг',
    'home.stats.countries': 'Доставлено в країни',
    'home.footer.about.title': 'Про Odesa Holiday Postcards',
    'home.footer.about.description': 'Створюйте та діліться красивими цифровими листівками, що showcasing найкращі пам\'ятки Одеси.',
    'home.footer.links.title': 'Корисні посилання',
    'home.footer.support.title': 'Підтримка',
    'home.footer.social.title': 'Слідкуйте за нами',
    'home.footer.copyright': '© 2024 Odesa Holiday Postcards. Всі права захищені.',

    // Dashboard
    'dashboard.welcome': 'Ласкаво просимо назад',
    'dashboard.stats.postcards': 'Листівки',
    'dashboard.stats.orders': 'Замовлення',
    'dashboard.stats.stories': 'AI історії',
    'dashboard.quickActions': 'Швидкі дії',
    'dashboard.recentActivity': 'Нещодавня активність',
    'dashboard.popularTemplates': 'Популярні шаблони',
    'dashboard.viewAll': 'Переглянути все',
    'dashboard.noActivity': 'Ще немає активності',

    // Story Creator
    'story.title': 'AI Генератор історій',
    'story.selectPreferences': 'Виберіть ваші вподобання',
    'story.location': 'Локація',
    'story.mood': 'Настрій',
    'story.length': 'Довжина',
    'story.generate': 'Згенерувати історію',
    'story.save': 'Зберегти',
    'story.share': 'Поділитися',
    'story.instagram': 'Instagram',
    'story.facebook': 'Facebook',
    'story.twitter': 'Twitter',
    'story.saving': 'Збереження...',
    'story.generating': 'Генерація...',
    'story.saved': 'Збережено!',
    'story.shareSuccess': 'Успішно поділились!',
    'story.error': 'Виникла помилка. Спробуйте ще раз.',

    // Navigation
    'nav.templates': 'Шаблони',
    'nav.pricing': 'Ціни',
    'nav.gallery': 'Галерея',
    'nav.stories': 'Історії',
    'nav.subscription': 'Підписка',

    // Forms & Inputs
    'form.email.placeholder': 'Введіть вашу електронну пошту',
    'form.password.placeholder': 'Введіть ваш пароль',
    'form.confirmPassword.placeholder': 'Підтвердіть пароль',
    'form.firstName.placeholder': 'Ім\'я',
    'form.lastName.placeholder': 'Прізвище',
    'form.required': 'Це поле обов\'язкове',
    'form.invalid': 'Невірний формат',

    // Subscription Plans
    'plan.digitalFree': 'Цифрова безкоштовна',
    'plan.printShip': 'Друк і доставка',
    'plan.premiumAccess': 'Преміальний доступ',
    'plan.monthly': 'на місяць',
    'plan.features.digitalCards': 'Безкоштовні цифрові листівки',
    'plan.features.aiStories': 'AI історій на місяць',
    'plan.features.templates': 'Базові шаблони',
    'plan.features.exports': 'Стандартної якості експорт',
    'plan.features.unlimited': 'Необмежені цифрові листівки',
    'plan.features.freeShip': 'безкоштовна фізична листівка на місяць',
    'plan.features.noWatermarks': 'Без водяних знаків',
    'plan.features.premium': 'Преміальні шаблони включені',
    'plan.features.support': 'Пріоритетна підтримка клієнтів',
    'plan.features.shipping': 'Вартість доставки окремо',
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

    // Home Page
    'home.hero.subtitle': 'Create personalized digital postcards featuring Odesa\'s scenic landscapes and share memories with the world.',
    'home.hero.createButton': 'Create Free Postcard',
    'home.hero.watchDemo': 'Watch Demo',
    'home.features.title': 'Everything You Need to Create Amazing Postcards',
    'home.features.subtitle': 'From free digital creation to premium printing, we\'ve got all your postcard needs covered.',
    'home.features.templates.title': 'Premium Templates',
    'home.features.templates.description': 'Beautiful, professionally designed templates featuring Odesa\'s most iconic landmarks and views.',
    'home.features.customization.title': 'Easy Customization',
    'home.features.customization.description': 'Add your photos, customize text, choose fonts, and personalize every detail with our intuitive editor.',
    'home.features.sharing.title': 'Social Sharing',
    'home.features.sharing.description': 'Share instantly on Instagram, Facebook, Twitter, or send via email to friends and family worldwide.',
    'home.features.printing.title': 'Print & Ship',
    'home.features.printing.description': 'Order high-quality printed postcards delivered anywhere in the world. Perfect for traditional mail.',
    'home.templates.title': 'Discover Odesa\'s Beauty',
    'home.templates.subtitle': 'Choose from our curated collection of stunning Odesa landmarks and coastal views.',
    'home.templates.viewAll': 'View All Templates',
    'home.pricing.title': 'Simple, Transparent Pricing',
    'home.pricing.subtitle': 'Start for free, upgrade when you\'re ready to print and ship.',
    'home.pricing.free.description': 'Perfect for digital postcards',
    'home.pricing.print.description': 'Digital plus physical postcards with AI stories',
    'home.pricing.premium.description': 'Full access with premium features and unlimited AI',
    'home.pricing.getStarted': 'Get Started Free',
    'home.pricing.orderPrint': 'Order Printed Postcard',
    'home.pricing.upgrade': 'Upgrade to Premium',
    'home.pricing.bulk': 'Need bulk orders for your business or event?',
    'home.pricing.contact': 'Contact us for custom pricing',
    'home.gallery.title': 'Created by Travelers Like You',
    'home.gallery.subtitle': 'Join thousands of happy tourists sharing their Odesa memories.',
    'home.stats.postcards': 'postcards created',
    'home.stats.rating': 'rating',
    'home.stats.countries': 'Shipped to countries',
    'home.footer.about.title': 'About Odesa Holiday Postcards',
    'home.footer.about.description': 'Create and share beautiful digital postcards showcasing the best of Odesa\'s landmarks.',
    'home.footer.links.title': 'Quick Links',
    'home.footer.support.title': 'Support',
    'home.footer.social.title': 'Follow Us',
    'home.footer.copyright': '© 2024 Odesa Holiday Postcards. All rights reserved.',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.stats.postcards': 'Postcards',
    'dashboard.stats.orders': 'Orders',
    'dashboard.stats.stories': 'AI Stories',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.popularTemplates': 'Popular Templates',
    'dashboard.viewAll': 'View All',
    'dashboard.noActivity': 'No activity yet',

    // Story Creator
    'story.title': 'AI Story Generator',
    'story.selectPreferences': 'Select Your Preferences',
    'story.location': 'Location',
    'story.mood': 'Mood',
    'story.length': 'Length',
    'story.generate': 'Generate Story',
    'story.save': 'Save',
    'story.share': 'Share',
    'story.instagram': 'Instagram',
    'story.facebook': 'Facebook',
    'story.twitter': 'Twitter',
    'story.saving': 'Saving...',
    'story.generating': 'Generating...',
    'story.saved': 'Saved!',
    'story.shareSuccess': 'Successfully shared!',
    'story.error': 'An error occurred. Please try again.',

    // Navigation
    'nav.templates': 'Templates',
    'nav.pricing': 'Pricing',
    'nav.gallery': 'Gallery',
    'nav.stories': 'Stories',
    'nav.subscription': 'Subscription',

    // Forms & Inputs
    'form.email.placeholder': 'Enter your email',
    'form.password.placeholder': 'Enter your password',
    'form.confirmPassword.placeholder': 'Confirm password',
    'form.firstName.placeholder': 'First name',
    'form.lastName.placeholder': 'Last name',
    'form.required': 'This field is required',
    'form.invalid': 'Invalid format',

    // Subscription Plans
    'plan.digitalFree': 'Digital Free',
    'plan.printShip': 'Print & Ship',
    'plan.premiumAccess': 'Premium Access',
    'plan.monthly': 'per month',
    'plan.features.digitalCards': 'Free digital postcards',
    'plan.features.aiStories': 'AI stories per month',
    'plan.features.templates': 'Basic templates',
    'plan.features.exports': 'Standard quality exports',
    'plan.features.unlimited': 'Unlimited digital postcards',
    'plan.features.freeShip': 'free physical postcard per month',
    'plan.features.noWatermarks': 'No watermarks',
    'plan.features.premium': 'Premium templates included',
    'plan.features.support': 'Priority customer support',
    'plan.features.shipping': 'Shipping costs apply separately',
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
    // Reload the page to ensure all components reflect the new language
    setTimeout(() => {
      window.location.reload();
    }, 100);
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