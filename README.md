# University Course Management System

Ein vollständiges Kurs- & Einschreibesystem gebaut mit Next.js, TypeScript und Supabase, das nach SOLID-Prinzipien entwickelt wurde.

## 🏗️ Architektur & SOLID-Prinzipien

Das System folgt strikt den SOLID-Prinzipien:

- **Single Responsibility**: Jede Klasse/Komponente hat nur eine Verantwortung
- **Open/Closed**: Erweiterbar ohne bestehenden Code zu ändern
- **Liskov Substitution**: Interfaces ermöglichen austauschbare Komponenten
- **Interface Segregation**: Keine überflüssigen Methoden in Interfaces
- **Dependency Inversion**: Logik ist von der Datenbankimplementierung getrennt

## 📊 Datenmodell

- **Students**: Studenten mit persönlichen Daten und Matrikelnummer
- **Lecturers**: Dozenten mit Fachbereich
- **Courses**: Kurse mit Kapazitätsbegrenzung und Terminen
- **Enrollments**: n:m Beziehung zwischen Studenten und Kursen

Alle Tabellen haben UUID als Primärschlüssel und Zeitstempel für created_at/updated_at.

## 🚀 Features

### CRUD-Funktionalitäten
- **Studenten**: Erstellen, Lesen, Aktualisieren, Löschen
- **Kurse**: Erstellen, Lesen, Aktualisieren, Löschen
- **Einschreibungen**: Einschreiben, Lesen, Abmelden
- **Dozenten**: Lesen, Erstellen (optional)

### Business Logic
- Automatische Kapazitätsprüfung bei Einschreibungen
- Validierung von Kursdaten und Terminen
- Eindeutige E-Mail-Adressen und Matrikelnummern
- Abmeldeschutz (7 Tage vor Kursbeginn)

### UI Features
- Responsive Dashboard mit Navigation
- Modulare, wiederverwendbare Komponenten
- Fehlerbehandlung und Loading States
- Intuitive Benutzerführung

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Architecture**: SOLID Principles, Repository Pattern, Service Layer
- **State Management**: React Hooks (lokal)

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
├── components/             # UI-Komponenten
│   ├── students/          # Student-spezifische Komponenten
│   ├── courses/           # Kurs-spezifische Komponenten
│   ├── enrollments/       # Einschreibungs-Komponenten
│   └── Dashboard.tsx      # Haupt-Dashboard
├── services/              # Business Logic Layer
│   ├── repositories/      # Datenbank-Repositories
│   ├── StudentService.ts  # Student Business Logic
│   ├── CourseService.ts   # Kurs Business Logic
│   ├── EnrollmentService.ts # Einschreibungs Business Logic
│   ├── LecturerService.ts # Dozenten Business Logic
│   └── ServiceFactory.ts  # Dependency Injection
├── models/                # Interfaces und Typen
│   └── interfaces.ts      # Service & Repository Interfaces
├── types/                 # TypeScript Definitionen
│   └── database.ts        # Supabase Typen
└── lib/                   # Utilities
    └── supabase.ts        # Supabase Client
```

## 🔧 Setup & Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd university-course-system
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
```bash
cp .env.example .env.local
```

Fülle die Supabase-Konfiguration in `.env.local` aus:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### Option A: Supabase Cloud
1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Kopiere URL und Anon Key in deine `.env.local`
3. Führe das SQL-Schema aus:
   ```sql
   -- Kopiere den Inhalt von supabase-schema.sql in den SQL Editor
   ```

#### Option B: Lokale Supabase (Docker)
```bash
# Supabase CLI installieren
npm install -g @supabase/cli

# Projekt initialisieren
supabase init

# Lokale Instanz starten
supabase start

# Schema anwenden
supabase db reset
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🎯 Verwendung

### Dashboard Navigation
- **Students**: Studenten verwalten (CRUD)
- **Courses**: Kurse verwalten (CRUD)
- **Enrollments**: Ein- und Abmeldungen verwalten

### Workflow
1. Dozenten und Studenten anlegen
2. Kurse mit Kapazitätslimits erstellen
3. Studenten für Kurse einschreiben
4. Einschreibungen verwalten und überwachen

## 🧪 Testing

Das System ist für Tests vorbereitet:

```typescript
// Beispiel für Service-Tests mit Mock-Repositories
const mockStudentRepo = new MockStudentRepository()
const factory = ServiceFactory.createForTesting(mockStudentRepo, ...)
const studentService = factory.getStudentService()
```

## 🔒 Sicherheit & Validierung

- **Input Validation**: Alle Eingaben werden validiert
- **Email Validation**: Regex-basierte E-Mail-Prüfung
- **Unique Constraints**: Eindeutige E-Mails und Matrikelnummern
- **Referential Integrity**: Foreign Key Constraints
- **Capacity Enforcement**: Database-Level Triggers

## 📈 Erweiterungsmöglichkeiten

Das System ist nach dem Open/Closed-Prinzip erweiterbar:

- Neue Repository-Implementierungen (z.B. für andere Datenbanken)
- Zusätzliche Services (z.B. NotificationService)
- Erweiterte UI-Komponenten
- Authentication & Authorization
- Reporting & Analytics

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe Tests
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - siehe LICENSE Datei für Details.