export type TranslationKey =
  | 'app.name'
  | 'nav.login'
  | 'nav.signup'
  | 'nav.getStarted'
  | 'nav.watchDemo'
  | 'home.tagline'
  | 'home.title1'
  | 'home.title2'
  | 'home.subtitle'
  | 'home.cta.start'
  | 'home.cta.demo'
  | 'home.stats.topics'
  | 'home.stats.topicsSub'
  | 'home.stats.learners'
  | 'home.stats.learnersSub'
  | 'home.stats.rating'
  | 'home.stats.ratingSub'
  | 'home.features.title'
  | 'home.features.subtitle'
  | 'home.features.curated.title'
  | 'home.features.curated.desc'
  | 'home.features.interactive.title'
  | 'home.features.interactive.desc'
  | 'home.features.progress.title'
  | 'home.features.progress.desc'
  | 'home.cta2.title'
  | 'home.cta2.subtitle'
  | 'home.cta2.button'
  | 'home.footer'
  | 'auth.backToHome'
  | 'auth.welcomeBack'
  | 'auth.continueJourney'
  | 'auth.continueGoogle'
  | 'auth.continueFacebook'
  | 'auth.or'
  | 'auth.email'
  | 'auth.password'
  | 'auth.forgot'
  | 'auth.signIn'
  | 'auth.noAccount'
  | 'auth.createOne'
  | 'auth.terms'
  | 'auth.privacy'
  | 'auth.bySigningIn'
  | 'auth.startJourney'
  | 'auth.signUpTitle'
  | 'auth.signUpSubtitle'
  | 'auth.fullName'
  | 'auth.signUp'
  | 'auth.haveAccount'
  | 'auth.signInLink'
  | 'auth.createAccount'
  | 'auth.minPassword'
  | 'auth.byCreatingAccount'
  | 'dashboard.loading'
  | 'dashboard.loginPrompt'
  | 'dashboard.loginButton'
  | 'dashboard.setupTitle'
  | 'dashboard.setupSubtitle'
  | 'dashboard.setupButton'
  | 'dashboard.header'
  | 'dashboard.subjects'
  | 'dashboard.chaptersSelected'
  | 'dashboard.selectChapter'
  | 'dashboard.selectSubject'
  | 'dashboard.selectSubjectHint'
  | 'dashboard.profile'
  | 'dashboard.board'
  | 'dashboard.grade'
  | 'dashboard.progress'
  | 'dashboard.totalChapters'
  | 'dashboard.chaptersSelectedLabel'
  | 'dashboard.acrossSubjects'
  | 'dashboard.learningGuide'
  | 'setup.title'
  | 'setup.subtitle'
  | 'setup.curriculum'
  | 'setup.grade'
  | 'setup.chapters'
  | 'setup.next'
  | 'setup.back'
  | 'setup.finish'
  | 'setup.loading'
  | 'setup.error'
  | 'setup.selectAll'
  | 'setup.clearAll'
  | 'setup.welcome'
  | 'setup.boardHint'
  | 'setup.gradeHint'
  | 'setup.chaptersHint'
  | 'chapter.loading'
  | 'chapter.error'
  | 'chapter.back'
  | 'chapter.sections'
  | 'chapter.brailleGuide'
  | 'chapter.generateBraille'
  | 'micro.loading'
  | 'micro.error'
  | 'micro.back'
  | 'micro.storyMode'
  | 'micro.generatingStory'
  | 'micro.generatingAudio'
  | 'micro.brailleOutput'
  | 'micro.generatingBraille'
  | 'micro.previous'
  | 'micro.next'
  | 'micro.finish'
  | 'micro.storyNotReady'
  | 'micro.videoNotAvailable'
  | 'micro.generateStory'
  | 'micro.quickCheck'
  | 'micro.keyTakeaways'
  | 'micro.example'
  | 'micro.timeLimit'
  | 'micro.viewTranscript'
  | 'micro.type.article'
  | 'micro.type.story'
  | 'micro.type.quiz'
  | 'micro.type.practice'
  | 'guide.title'
  | 'guide.subtitle'
  | 'guide.voiceCommands'
  | 'guide.voiceIntro'
  | 'guide.voice.story'
  | 'guide.voice.braille'
  | 'guide.voice.focus'
  | 'guide.voice.play'
  | 'guide.voice.dashboard'
  | 'guide.readingSupport'
  | 'guide.reading.largeText'
  | 'guide.reading.story'
  | 'guide.reading.braille'
  | 'guide.reading.keyboard'
  | 'guide.visualFirst'
  | 'guide.visual.captions'
  | 'guide.visual.signs'
  | 'guide.visual.toggle'
  | 'guide.focusSupport'
  | 'guide.focus.mode'
  | 'guide.focus.slides'
  | 'guide.focus.controls'
  | 'controls.contentSettings'
  | 'controls.focus'
  | 'controls.largeText'
  | 'controls.captions'
  | 'controls.signs'
  | 'controls.calmMotion'
  | 'controls.language'
  | 'setup.preferences'
  | 'story.mode'
  | 'story.pause'
  | 'story.play'
  | 'story.stop'
  | 'story.regen'
  | 'story.regenLoading'
  | 'story.slide'
  | 'story.imageUnavailable'
  | 'story.next'
  | 'story.statusAuto'
  | 'story.statusManual';

type Translations = Record<TranslationKey, string>;

export const translations: Record<'en' | 'es' | 'hi', Translations> = {
  en: {
    'app.name': 'LearnHub',
    'nav.login': 'Log in',
    'nav.signup': 'Get started',
    'nav.getStarted': 'Get started',
    'nav.watchDemo': 'Watch demo',
    'home.tagline': '✨ Welcome to the future of learning',
    'home.title1': 'Learning made',
    'home.title2': 'simple & beautiful.',
    'home.subtitle': 'A thoughtfully designed platform that adapts to how you think. Master new skills through interactive lessons, watch your growth come alive, and celebrate every milestone with visual progress that matters.',
    'home.cta.start': 'Start learning free',
    'home.cta.demo': 'Watch demo',
    'home.stats.topics': 'Topics',
    'home.stats.topicsSub': 'Curated for growth',
    'home.stats.learners': 'Learners',
    'home.stats.learnersSub': 'Already learning',
    'home.stats.rating': 'Rating',
    'home.stats.ratingSub': 'From real users',
    'home.features.title': 'Everything you need to learn powerfully',
    'home.features.subtitle': 'Built with care for learners of all ages. Thoughtful design. Real results.',
    'home.features.curated.title': 'Curated Topics',
    'home.features.curated.desc': 'Over 100 carefully structured topics across science, math, art, and beyond. Each designed for progressive mastery.',
    'home.features.interactive.title': 'Interactive Learning',
    'home.features.interactive.desc': 'Hands-on exercises, visual explanations, and real-world examples that make concepts click instantly.',
    'home.features.progress.title': 'Visible Progress',
    'home.features.progress.desc': 'See exactly where you are. Celebrate wins, identify growth areas, and stay motivated every day.',
    'home.cta2.title': 'Ready to transform how you learn?',
    'home.cta2.subtitle': "Join thousands of learners who've discovered a smarter way to grow.",
    'home.cta2.button': 'Start free today',
    'home.footer': 'Made with 💜 for learners everywhere',
    'auth.backToHome': 'Back to home',
    'auth.welcomeBack': 'Welcome back',
    'auth.continueJourney': 'Continue your learning journey.',
    'auth.continueGoogle': 'Continue with Google',
    'auth.continueFacebook': 'Continue with Facebook',
    'auth.or': 'or',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot?',
    'auth.signIn': 'Sign in',
    'auth.noAccount': "Don't have an account?",
    'auth.createOne': 'Create one',
    'auth.bySigningIn': 'By signing in, you agree to our',
    'auth.terms': 'Terms',
    'auth.privacy': 'Privacy',
    'auth.startJourney': 'Start your learning journey',
    'auth.signUpTitle': 'Create your account',
    'auth.signUpSubtitle': 'Start learning in minutes.',
    'auth.fullName': 'Full name',
    'auth.signUp': 'Sign up',
    'auth.haveAccount': 'Already have an account?',
    'auth.signInLink': 'Sign in',
    'auth.createAccount': 'Create account',
    'auth.minPassword': 'Minimum 8 characters',
    'auth.byCreatingAccount': 'By creating an account, you agree to our',
    'dashboard.loading': 'Loading your dashboard...',
    'dashboard.loginPrompt': 'Please log in to access your dashboard',
    'dashboard.loginButton': 'Go to Login',
    'dashboard.setupTitle': 'Welcome!',
    'dashboard.setupSubtitle': "Let's set up your learning profile to get started.",
    'dashboard.setupButton': 'Complete Setup',
    'dashboard.header': 'Dashboard',
    'dashboard.subjects': 'Subjects',
    'dashboard.chaptersSelected': 'chapters selected',
    'dashboard.selectChapter': 'Select a chapter to start learning.',
    'dashboard.selectSubject': 'Select a Subject',
    'dashboard.selectSubjectHint': 'Choose a subject from the sidebar to view your selected chapters.',
    'dashboard.profile': 'Your Profile',
    'dashboard.board': 'Board',
    'dashboard.grade': 'Grade',
    'dashboard.progress': 'Progress',
    'dashboard.totalChapters': 'chapters',
    'dashboard.chaptersSelectedLabel': 'Chapters Selected',
    'dashboard.acrossSubjects': 'across {count} subjects',
    'dashboard.learningGuide': 'Learning Support Guide',
    'setup.title': 'Set up your learning',
    'setup.subtitle': 'Tell us what you want to learn.',
    'setup.curriculum': 'Curriculum',
    'setup.grade': 'Grade',
    'setup.chapters': 'Chapters',
    'setup.next': 'Next',
    'setup.back': 'Back',
    'setup.finish': 'Finish setup',
    'setup.loading': 'Loading...',
    'setup.error': 'Something went wrong.',
    'setup.selectAll': 'Select all',
    'setup.clearAll': 'Clear all',
    'setup.welcome': 'Welcome',
    'setup.boardHint': "Choose your education board. We'll show you content tailored to your curriculum.",
    'setup.gradeHint': 'What class are you currently in? This helps us show you the right content.',
    'setup.chaptersHint': 'Select the chapters you want to learn first.',
    'chapter.loading': 'Loading chapter...',
    'chapter.error': 'Failed to load chapter.',
    'chapter.back': 'Back to dashboard',
    'chapter.sections': 'Sections',
    'chapter.brailleGuide': 'Braille Guide',
    'chapter.generateBraille': 'Generate braille...',
    'micro.loading': 'Loading lesson...',
    'micro.error': 'Content not found',
    'micro.back': 'Go Back',
    'micro.storyMode': 'Story Mode',
    'micro.generatingStory': 'Generating Story...',
    'micro.generatingAudio': 'Generating narration and captions...',
    'micro.brailleOutput': 'Braille Output',
    'micro.generatingBraille': 'Generating braille...',
    'micro.previous': 'Previous',
    'micro.next': 'Next',
    'micro.finish': 'Finish Section',
    'micro.storyNotReady': 'Story content not available.',
    'micro.videoNotAvailable': 'Video not available',
    'micro.generateStory': 'Generate Story',
    'micro.quickCheck': 'Quick Check',
    'micro.keyTakeaways': 'Key Takeaways',
    'micro.example': 'Example',
    'micro.timeLimit': 'Time Limit',
    'micro.viewTranscript': 'View Transcript',
    'micro.type.article': 'Article',
    'micro.type.story': 'Story Mode',
    'micro.type.quiz': 'Quiz',
    'micro.type.practice': 'Practice',
    'guide.title': 'Learning Support Guide',
    'guide.subtitle': 'Content settings, shortcuts, and controls',
    'guide.voiceCommands': 'Voice Commands',
    'guide.voiceIntro': 'Use the mic button or say the commands below.',
    'guide.voice.story': '"Open story mode" - start comic-style slides for a topic',
    'guide.voice.braille': '"Open braille" - show braille output for the current topic',
    'guide.voice.focus': '"Enable focus mode" - distraction-free layout',
    'guide.voice.play': '"Play / pause / resume / stop" - control narration',
    'guide.voice.dashboard': '"Go to dashboard" - navigation',
    'guide.readingSupport': 'Reading Support',
    'guide.reading.largeText': 'Enable Large Text for easier reading.',
    'guide.reading.story': 'Use Story Mode to get narrated visual explanations with captions.',
    'guide.reading.braille': 'Open Braille output on any chapter or article lesson.',
    'guide.reading.keyboard': 'Keyboard: press Tab to move through controls, Enter to activate.',
    'guide.visualFirst': 'Visual-First Learning',
    'guide.visual.captions': 'Captions are always shown in Story Mode.',
    'guide.visual.signs': 'Sign language overlays appear when sign assets are available.',
    'guide.visual.toggle': 'Use Signs toggle to show hand sign images when available.',
    'guide.focusSupport': 'Focus Support',
    'guide.focus.mode': 'Use Focus Mode to reduce distractions and keep one idea at a time.',
    'guide.focus.slides': 'Short story slides help with chunked learning.',
    'guide.focus.controls': 'Use the "Play / Pause / Resume" controls for pacing.',
    'controls.contentSettings': 'Content Settings',
    'controls.focus': 'Focus',
    'controls.largeText': 'Large Text',
    'controls.captions': 'Captions',
    'controls.signs': 'Signs',
    'controls.calmMotion': 'Calm Motion',
    'controls.language': 'Language',
    'setup.preferences': 'Preferences',
    'story.mode': 'Story Mode',
    'story.pause': 'Pause',
    'story.play': 'Play',
    'story.stop': 'Stop',
    'story.regen': 'Regenerate audio',
    'story.regenLoading': 'Regenerating...',
    'story.slide': 'Slide',
    'story.imageUnavailable': 'Image not available',
    'story.next': 'Next',
    'story.statusAuto': 'Auto-playing',
    'story.statusManual': 'Manual navigation',
  },
  es: {
    'app.name': 'LearnHub',
    'nav.login': 'Iniciar sesión',
    'nav.signup': 'Comenzar',
    'nav.getStarted': 'Comenzar',
    'nav.watchDemo': 'Ver demo',
    'home.tagline': '✨ Bienvenido al futuro del aprendizaje',
    'home.title1': 'Aprender hecho',
    'home.title2': 'simple y hermoso.',
    'home.subtitle': 'Una plataforma diseñada para adaptarse a cómo piensas. Domina nuevas habilidades con lecciones interactivas, ve tu crecimiento cobrar vida y celebra cada avance con progreso visual.',
    'home.cta.start': 'Empieza a aprender gratis',
    'home.cta.demo': 'Ver demo',
    'home.stats.topics': 'Temas',
    'home.stats.topicsSub': 'Curado para crecer',
    'home.stats.learners': 'Estudiantes',
    'home.stats.learnersSub': 'Ya aprendiendo',
    'home.stats.rating': 'Calificación',
    'home.stats.ratingSub': 'De usuarios reales',
    'home.features.title': 'Todo lo que necesitas para aprender con fuerza',
    'home.features.subtitle': 'Creado con cuidado para estudiantes de todas las edades. Diseño pensado. Resultados reales.',
    'home.features.curated.title': 'Temas Curados',
    'home.features.curated.desc': 'Más de 100 temas cuidadosamente estructurados en ciencia, matemáticas, arte y más. Diseñados para el dominio progresivo.',
    'home.features.interactive.title': 'Aprendizaje Interactivo',
    'home.features.interactive.desc': 'Ejercicios prácticos, explicaciones visuales y ejemplos reales que hacen que los conceptos encajen.',
    'home.features.progress.title': 'Progreso Visible',
    'home.features.progress.desc': 'Ve exactamente dónde estás. Celebra logros, identifica áreas de mejora y mantén la motivación.',
    'home.cta2.title': '¿Listo para transformar cómo aprendes?',
    'home.cta2.subtitle': 'Únete a miles de estudiantes que descubrieron una forma más inteligente de crecer.',
    'home.cta2.button': 'Empieza gratis hoy',
    'home.footer': 'Hecho con 💜 para estudiantes de todo el mundo',
    'auth.backToHome': 'Volver al inicio',
    'auth.welcomeBack': 'Bienvenido de nuevo',
    'auth.continueJourney': 'Continúa tu viaje de aprendizaje.',
    'auth.continueGoogle': 'Continuar con Google',
    'auth.continueFacebook': 'Continuar con Facebook',
    'auth.or': 'o',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.forgot': '¿Olvidaste?',
    'auth.signIn': 'Iniciar sesión',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.createOne': 'Crear una',
    'auth.bySigningIn': 'Al iniciar sesión, aceptas nuestros',
    'auth.terms': 'Términos',
    'auth.privacy': 'Privacidad',
    'auth.startJourney': 'Comienza tu viaje de aprendizaje',
    'auth.signUpTitle': 'Crea tu cuenta',
    'auth.signUpSubtitle': 'Empieza a aprender en minutos.',
    'auth.fullName': 'Nombre completo',
    'auth.signUp': 'Registrarse',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'auth.signInLink': 'Inicia sesión',
    'auth.createAccount': 'Crear cuenta',
    'auth.minPassword': 'Mínimo 8 caracteres',
    'auth.byCreatingAccount': 'Al crear una cuenta, aceptas nuestros',
    'dashboard.loading': 'Cargando tu panel...',
    'dashboard.loginPrompt': 'Por favor inicia sesión para acceder a tu panel',
    'dashboard.loginButton': 'Ir a iniciar sesión',
    'dashboard.setupTitle': '¡Bienvenido!',
    'dashboard.setupSubtitle': 'Configura tu perfil de aprendizaje para comenzar.',
    'dashboard.setupButton': 'Completar configuración',
    'dashboard.header': 'Panel',
    'dashboard.subjects': 'Materias',
    'dashboard.chaptersSelected': 'capítulos seleccionados',
    'dashboard.selectChapter': 'Selecciona un capítulo para comenzar a aprender.',
    'dashboard.selectSubject': 'Selecciona una materia',
    'dashboard.selectSubjectHint': 'Elige una materia en la barra lateral para ver tus capítulos seleccionados.',
    'dashboard.profile': 'Tu perfil',
    'dashboard.board': 'Tablero',
    'dashboard.grade': 'Grado',
    'dashboard.progress': 'Progreso',
    'dashboard.totalChapters': 'capítulos',
    'dashboard.chaptersSelectedLabel': 'Capítulos seleccionados',
    'dashboard.acrossSubjects': 'en {count} materias',
    'dashboard.learningGuide': 'Guía de apoyo',
    'setup.title': 'Configura tu aprendizaje',
    'setup.subtitle': 'Cuéntanos qué quieres aprender.',
    'setup.curriculum': 'Plan',
    'setup.grade': 'Grado',
    'setup.chapters': 'Capítulos',
    'setup.next': 'Siguiente',
    'setup.back': 'Atrás',
    'setup.finish': 'Finalizar',
    'setup.loading': 'Cargando...',
    'setup.error': 'Algo salió mal.',
    'setup.selectAll': 'Seleccionar todo',
    'setup.clearAll': 'Limpiar todo',
    'setup.welcome': 'Bienvenido',
    'setup.boardHint': 'Elige tu plan educativo. Verás contenido acorde a tu currículo.',
    'setup.gradeHint': '¿En qué curso estás? Esto nos ayuda a mostrar el contenido adecuado.',
    'setup.chaptersHint': 'Selecciona los capítulos que quieres aprender primero.',
    'chapter.loading': 'Cargando capítulo...',
    'chapter.error': 'No se pudo cargar el capítulo.',
    'chapter.back': 'Volver al panel',
    'chapter.sections': 'Secciones',
    'chapter.brailleGuide': 'Guía braille',
    'chapter.generateBraille': 'Generando braille...',
    'micro.loading': 'Cargando lección...',
    'micro.error': 'Contenido no encontrado',
    'micro.back': 'Volver',
    'micro.storyMode': 'Modo Historia',
    'micro.generatingStory': 'Generando historia...',
    'micro.generatingAudio': 'Generando narración y subtítulos...',
    'micro.brailleOutput': 'Salida braille',
    'micro.generatingBraille': 'Generando braille...',
    'micro.previous': 'Anterior',
    'micro.next': 'Siguiente',
    'micro.finish': 'Finalizar sección',
    'micro.storyNotReady': 'Contenido de historia no disponible.',
    'micro.videoNotAvailable': 'Video no disponible',
    'micro.generateStory': 'Generar historia',
    'micro.quickCheck': 'Comprobación rápida',
    'micro.keyTakeaways': 'Puntos clave',
    'micro.example': 'Ejemplo',
    'micro.timeLimit': 'Límite de tiempo',
    'micro.viewTranscript': 'Ver transcripción',
    'micro.type.article': 'Artículo',
    'micro.type.story': 'Modo Historia',
    'micro.type.quiz': 'Quiz',
    'micro.type.practice': 'Práctica',
    'guide.title': 'Guía de apoyo',
    'guide.subtitle': 'Configuración, atajos y controles',
    'guide.voiceCommands': 'Comandos de voz',
    'guide.voiceIntro': 'Usa el botón del micrófono o di los comandos.',
    'guide.voice.story': '"Abrir modo historia" - inicia diapositivas tipo cómic',
    'guide.voice.braille': '"Abrir braille" - muestra la salida braille',
    'guide.voice.focus': '"Activar modo enfoque" - diseño sin distracciones',
    'guide.voice.play': '"Reproducir / pausar / reanudar / detener" - controlar narración',
    'guide.voice.dashboard': '"Ir al panel" - navegación',
    'guide.readingSupport': 'Apoyo de lectura',
    'guide.reading.largeText': 'Activa texto grande para leer mejor.',
    'guide.reading.story': 'Usa Modo Historia para explicaciones narradas con subtítulos.',
    'guide.reading.braille': 'Abre salida braille en cualquier capítulo o artículo.',
    'guide.reading.keyboard': 'Teclado: Tab para mover, Enter para activar.',
    'guide.visualFirst': 'Aprendizaje visual',
    'guide.visual.captions': 'Los subtítulos siempre se muestran en Modo Historia.',
    'guide.visual.signs': 'Las señas aparecen cuando hay activos disponibles.',
    'guide.visual.toggle': 'Usa el botón de Señas para mostrar imágenes de señas.',
    'guide.focusSupport': 'Apoyo de enfoque',
    'guide.focus.mode': 'Usa Modo Enfoque para reducir distracciones.',
    'guide.focus.slides': 'Diapositivas cortas ayudan a aprender por partes.',
    'guide.focus.controls': 'Usa los controles "Reproducir / Pausar / Reanudar" para el ritmo.',
    'controls.contentSettings': 'Ajustes de contenido',
    'controls.focus': 'Enfoque',
    'controls.largeText': 'Texto grande',
    'controls.captions': 'Subtítulos',
    'controls.signs': 'Señas',
    'controls.calmMotion': 'Movimiento suave',
    'controls.language': 'Idioma',
    'setup.preferences': 'Preferencias',
    'story.mode': 'Modo Historia',
    'story.pause': 'Pausa',
    'story.play': 'Reproducir',
    'story.stop': 'Detener',
    'story.regen': 'Regenerar audio',
    'story.regenLoading': 'Regenerando...',
    'story.slide': 'Diapositiva',
    'story.imageUnavailable': 'Imagen no disponible',
    'story.next': 'Siguiente',
    'story.statusAuto': 'Reproducción automática',
    'story.statusManual': 'Navegación manual',
  },
  hi: {
    'app.name': 'LearnHub',
    'nav.login': 'लॉग इन',
    'nav.signup': 'शुरू करें',
    'nav.getStarted': 'शुरू करें',
    'nav.watchDemo': 'डेमो देखें',
    'home.tagline': '✨ सीखने का भविष्य आपका स्वागत करता है',
    'home.title1': 'सीखना हुआ',
    'home.title2': 'सरल और सुंदर।',
    'home.subtitle': 'एक सोच-समझकर बनाया गया प्लेटफ़ॉर्म जो आपकी सोच के साथ ढलता है। इंटरैक्टिव पाठों से नई स्किल्स सीखें, अपनी प्रगति देखें और हर उपलब्धि का जश्न मनाएँ।',
    'home.cta.start': 'मुफ़्त में सीखना शुरू करें',
    'home.cta.demo': 'डेमो देखें',
    'home.stats.topics': 'विषय',
    'home.stats.topicsSub': 'विकास के लिए क्यूरेटेड',
    'home.stats.learners': 'सीखने वाले',
    'home.stats.learnersSub': 'पहले से सीख रहे हैं',
    'home.stats.rating': 'रेटिंग',
    'home.stats.ratingSub': 'वास्तविक उपयोगकर्ताओं से',
    'home.features.title': 'शक्तिशाली सीखने के लिए सब कुछ',
    'home.features.subtitle': 'हर उम्र के सीखने वालों के लिए। सोच-समझा डिज़ाइन, वास्तविक परिणाम।',
    'home.features.curated.title': 'क्यूरेटेड टॉपिक्स',
    'home.features.curated.desc': 'विज्ञान, गणित, कला और अन्य में 100+ सुव्यवस्थित विषय। क्रमिक mastery के लिए बनाए गए।',
    'home.features.interactive.title': 'इंटरैक्टिव लर्निंग',
    'home.features.interactive.desc': 'हैंड्स-ऑन अभ्यास, विज़ुअल व्याख्याएँ और रियल-वर्ल्ड उदाहरण जो कॉन्सेप्ट को आसान बनाते हैं।',
    'home.features.progress.title': 'दिखाई देने वाली प्रगति',
    'home.features.progress.desc': 'अपनी स्थिति साफ देखें, जीतों का जश्न मनाएँ और प्रेरित रहें।',
    'home.cta2.title': 'क्या आप सीखने का तरीका बदलने के लिए तैयार हैं?',
    'home.cta2.subtitle': 'हज़ारों सीखने वालों के साथ जुड़ें जिन्होंने स्मार्ट तरीका चुना है।',
    'home.cta2.button': 'आज ही मुफ़्त शुरू करें',
    'home.footer': 'सीखने वालों के लिए 💜 के साथ बनाया गया',
    'auth.backToHome': 'होम पर वापस',
    'auth.welcomeBack': 'वापसी पर स्वागत है',
    'auth.continueJourney': 'अपनी लर्निंग जर्नी जारी रखें।',
    'auth.continueGoogle': 'Google से जारी रखें',
    'auth.continueFacebook': 'Facebook से जारी रखें',
    'auth.or': 'या',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.forgot': 'भूल गए?',
    'auth.signIn': 'साइन इन',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.createOne': 'एक बनाएं',
    'auth.bySigningIn': 'साइन इन करके आप हमारे',
    'auth.terms': 'नियम',
    'auth.privacy': 'गोपनीयता',
    'auth.startJourney': 'अपनी सीखने की यात्रा शुरू करें',
    'auth.signUpTitle': 'अपना खाता बनाएं',
    'auth.signUpSubtitle': 'मिनटों में सीखना शुरू करें।',
    'auth.fullName': 'पूरा नाम',
    'auth.signUp': 'साइन अप',
    'auth.haveAccount': 'पहले से खाता है?',
    'auth.signInLink': 'साइन इन करें',
    'auth.createAccount': 'खाता बनाएं',
    'auth.minPassword': 'कम से कम 8 अक्षर',
    'auth.byCreatingAccount': 'खाता बनाने पर आप हमारे',
    'dashboard.loading': 'आपका डैशबोर्ड लोड हो रहा है...',
    'dashboard.loginPrompt': 'डैशबोर्ड देखने के लिए लॉग इन करें',
    'dashboard.loginButton': 'लॉग इन पेज पर जाएँ',
    'dashboard.setupTitle': 'स्वागत है!',
    'dashboard.setupSubtitle': 'शुरू करने के लिए अपना प्रोफ़ाइल सेट करें।',
    'dashboard.setupButton': 'सेटअप पूरा करें',
    'dashboard.header': 'डैशबोर्ड',
    'dashboard.subjects': 'विषय',
    'dashboard.chaptersSelected': 'अध्याय चुने गए',
    'dashboard.selectChapter': 'सीखना शुरू करने के लिए एक अध्याय चुनें।',
    'dashboard.selectSubject': 'एक विषय चुनें',
    'dashboard.selectSubjectHint': 'साइडबार से विषय चुनकर चुने गए अध्याय देखें।',
    'dashboard.profile': 'आपकी प्रोफ़ाइल',
    'dashboard.board': 'बोर्ड',
    'dashboard.grade': 'कक्षा',
    'dashboard.progress': 'प्रगति',
    'dashboard.totalChapters': 'अध्याय',
    'dashboard.chaptersSelectedLabel': 'चुने गए अध्याय',
    'dashboard.acrossSubjects': '{count} विषयों में',
    'dashboard.learningGuide': 'लर्निंग सपोर्ट गाइड',
    'setup.title': 'अपनी लर्निंग सेट करें',
    'setup.subtitle': 'बताएँ आप क्या सीखना चाहते हैं।',
    'setup.curriculum': 'करिकुलम',
    'setup.grade': 'कक्षा',
    'setup.chapters': 'अध्याय',
    'setup.next': 'आगे',
    'setup.back': 'पीछे',
    'setup.finish': 'सेटअप पूरा करें',
    'setup.loading': 'लोड हो रहा है...',
    'setup.error': 'कुछ गलत हो गया।',
    'setup.selectAll': 'सभी चुनें',
    'setup.clearAll': 'सभी हटाएँ',
    'setup.welcome': 'स्वागत है',
    'setup.boardHint': 'अपना बोर्ड चुनें। हम उसी के अनुसार सामग्री दिखाएँगे।',
    'setup.gradeHint': 'आप किस कक्षा में हैं? इससे सही सामग्री दिखाने में मदद मिलती है।',
    'setup.chaptersHint': 'पहले वे अध्याय चुनें जिन्हें आप सीखना चाहते हैं।',
    'chapter.loading': 'अध्याय लोड हो रहा है...',
    'chapter.error': 'अध्याय लोड नहीं हो सका।',
    'chapter.back': 'डैशबोर्ड पर वापस',
    'chapter.sections': 'सेक्शन',
    'chapter.brailleGuide': 'ब्रेल गाइड',
    'chapter.generateBraille': 'ब्रेल बन रहा है...',
    'micro.loading': 'पाठ लोड हो रहा है...',
    'micro.error': 'सामग्री नहीं मिली',
    'micro.back': 'वापस जाएँ',
    'micro.storyMode': 'कहानी मोड',
    'micro.generatingStory': 'कहानी बन रही है...',
    'micro.generatingAudio': 'वाचन और कैप्शन बन रहे हैं...',
    'micro.brailleOutput': 'ब्रेल आउटपुट',
    'micro.generatingBraille': 'ब्रेल बन रहा है...',
    'micro.previous': 'पिछला',
    'micro.next': 'अगला',
    'micro.finish': 'सेक्शन पूरा करें',
    'micro.storyNotReady': 'कहानी सामग्री उपलब्ध नहीं है।',
    'micro.videoNotAvailable': 'वीडियो उपलब्ध नहीं है',
    'micro.generateStory': 'कहानी बनाएं',
    'micro.quickCheck': 'त्वरित जांच',
    'micro.keyTakeaways': 'मुख्य बातें',
    'micro.example': 'उदाहरण',
    'micro.timeLimit': 'समय सीमा',
    'micro.viewTranscript': 'ट्रांसक्रिप्ट देखें',
    'micro.type.article': 'लेख',
    'micro.type.story': 'कहानी मोड',
    'micro.type.quiz': 'क्विज़',
    'micro.type.practice': 'अभ्यास',
    'guide.title': 'लर्निंग सपोर्ट गाइड',
    'guide.subtitle': 'सेटिंग्स, शॉर्टकट्स और कंट्रोल्स',
    'guide.voiceCommands': 'वॉयस कमांड्स',
    'guide.voiceIntro': 'माइक बटन का उपयोग करें या कमांड बोलें।',
    'guide.voice.story': '"कहानी मोड खोलें" - कॉमिक शैली स्लाइड्स शुरू करें',
    'guide.voice.braille': '"ब्रेल खोलें" - वर्तमान विषय के लिए ब्रेल आउटपुट',
    'guide.voice.focus': '"फ़ोकस मोड चालू करें" - ध्यान भंग कम करें',
    'guide.voice.play': '"प्ले / पॉज़ / रेज़्यूम / स्टॉप" - वाचन नियंत्रण',
    'guide.voice.dashboard': '"डैशबोर्ड पर जाएँ" - नेविगेशन',
    'guide.readingSupport': 'रीडिंग सपोर्ट',
    'guide.reading.largeText': 'आसान पढ़ने के लिए बड़ा टेक्स्ट ऑन करें।',
    'guide.reading.story': 'कहानी मोड से वाचित विज़ुअल व्याख्या लें।',
    'guide.reading.braille': 'किसी भी अध्याय या लेख में ब्रेल आउटपुट खोलें।',
    'guide.reading.keyboard': 'कीबोर्ड: Tab से आगे बढ़ें, Enter से चुनें।',
    'guide.visualFirst': 'विज़ुअल-फर्स्ट लर्निंग',
    'guide.visual.captions': 'कहानी मोड में कैप्शन हमेशा दिखते हैं।',
    'guide.visual.signs': 'जब साइन एसेट हों, साइन ओवरले दिखते हैं।',
    'guide.visual.toggle': 'साइन बटन से हाथ के संकेत दिखाएँ।',
    'guide.focusSupport': 'फ़ोकस सपोर्ट',
    'guide.focus.mode': 'फ़ोकस मोड से ध्यान भंग कम करें।',
    'guide.focus.slides': 'छोटी स्लाइड्स से सीखना आसान होता है।',
    'guide.focus.controls': 'गति के लिए "प्ले / पॉज़ / रेज़्यूम" कंट्रोल्स उपयोग करें।',
    'controls.contentSettings': 'कंटेंट सेटिंग्स',
    'controls.focus': 'फ़ोकस',
    'controls.largeText': 'बड़ा टेक्स्ट',
    'controls.captions': 'कैप्शन',
    'controls.signs': 'साइन',
    'controls.calmMotion': 'शांत मोशन',
    'controls.language': 'भाषा',
    'setup.preferences': 'प्राथमिकताएँ',
    'story.mode': 'कहानी मोड',
    'story.pause': 'रोकें',
    'story.play': 'चलाएँ',
    'story.stop': 'रुकें',
    'story.regen': 'ऑडियो फिर से बनाएँ',
    'story.regenLoading': 'फिर से बन रहा है...',
    'story.slide': 'स्लाइड',
    'story.imageUnavailable': 'छवि उपलब्ध नहीं है',
    'story.next': 'अगला',
    'story.statusAuto': 'ऑटो-प्ले',
    'story.statusManual': 'मैन्युअल नेविगेशन',
  },
};

export const translate = (
  lang: 'en' | 'es' | 'hi',
  key: TranslationKey,
  params?: Record<string, string | number>
) => {
  const base = translations[lang][key] || translations.en[key] || key;
  if (!params) return base;
  return Object.entries(params).reduce((text, [param, value]) => {
    return text.replaceAll(`{${param}}`, String(value));
  }, base);
};
