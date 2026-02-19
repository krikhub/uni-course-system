# University Course Management System (Lokal)

Ein einfaches Kurs- & Einschreibesystem mit **Next.js, TypeScript** und **Supabase**.  
Dieses Setup ist für die **lokale Ausführung** optimiert – SQL-Tabellen sind bereits enthalten.

---

## 🔧 Installation & Lokales Setup

### 1. Repository klonen

```bash
git clone <repository-url>
cd university-course-system
```

### 2. Supabase lokal starten

Stelle sicher, dass Docker läuft:

```bash
supabase start
```

### 3. Umgebungsvariablen erstellen

Lege eine `.env.local` Datei im Projektordner an:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Dein Publishable Key>
```

> Den Publishable Key findest du auch mit dem Befehl `supabase status`.

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.  
Die Supabase Weboberfläche (SQL Editor) ist unter [http://localhost:54323](http://localhost:54323) verfügbar.

---

## 🚀 Hinweise

- SQL-Tabellen sind bereits enthalten – kein Schema muss manuell ausgeführt werden.
- Es werden keine zusätzlichen Dependencies wie `docker-compose` benötigt; nur Docker und Supabase müssen laufen.
- Den Publishable Key aus dem Supabase-Projekt verwenden.
