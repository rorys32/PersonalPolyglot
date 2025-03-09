# Personal Polyglot Architecture - Build 1.0.007

[User Interface]
  ├── index.html
  │   ├── Header (Progress Bar: dailyProgress)
  │   ├── Nav (Quizzes, Progress, Export, Reset)
  │   ├── Section: Languages (Sortable Containers)
  │   ├── Section: Quizzes (Hidden)
  │   └── Section: Progress (Hidden)
  ├── styles.css (Visual Styling)
  └── app.js (Core Logic)
       ├── Data Loading
       │   ├── languages.json (Language Config)
       │   ├── universal_phrases.json (25 Phrases/Lang)
       │   ├── personal_phrases.json (43 Phrases/Lang)
       │   ├── german_grammar.json (6 Rules)
       │   ├── russian_grammar.json (10 Rules)
       │   └── spanish_grammar.json (3 Rules)
       ├── State Management
       │   ├── languageData (Phrases + Grammar)
       │   ├── progress (Days, Material, Quizzes, Scores)
       │   ├── dailyProgress (Per Language)
       │   └── currentIndices (Flashcard Position)
       ├── Functions
       │   ├── renderLanguageContainers (UI Update)
       │   ├── nextPhrase/prevPhrase (Cycle Flashcards)
       │   ├── showQuizzes (Grammar Quiz Logic)
       │   ├── updateProgress (Track Learning)
       │   ├── updateDailyProgress (Daily Goal Check)
       │   ├── resetDailyProgress (Manual Reset)
       │   ├── playAudio (Stub)
       │   └── exportData (JSON Export)
       └── External Dependency
           └── SortableJS (Drag-and-Drop)

[Data Flow]
  - User → UI → app.js (Fetch Data → Render)
  - app.js → LocalStorage (Save/Load Progress)
  - app.js → JSON Files (Load Phrases/Grammar)
  - User → Quiz → app.js (Check Answer → Update Progress)

[Entity Relationships]
  - languages.json → Defines Languages (German, Russian, Spanish)
  - universal_phrases.json → Language-Specific Phrases (Travel, Food, etc.)
  - personal_phrases.json → User-Specific Stories (Music, Fishing, etc.)
  - grammar files → Language-Specific Rules (Cases, Conjugation)
  - progress → Tracks User Activity (Linked to Languages)