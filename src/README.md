# MVC Architektur - Universitäts-Kursverwaltungssystem

## Ordnerstruktur

```
src/
├── controllers/         # Controller Layer - Business Logic
│   ├── StudentController.ts
│   ├── CourseController.ts
│   └── EnrollmentController.ts
├── database/           # Database Layer - Data Access (Services)
│   ├── StudentService.ts
│   ├── CourseService.ts
│   ├── EnrollmentService.ts
│   ├── LecturerService.ts
│   └── index.ts
├── models/             # Model Layer - Data Structures
│   ├── Student.ts
│   ├── Course.ts
│   ├── Lecturer.ts
│   └── Enrollment.ts
├── views/              # View Layer - UI Components
│   └── components/
│       ├── Dashboard.tsx
│       ├── students/
│       ├── courses/
│       └── enrollments/
└── lib/                # Utilities
    └── supabase.ts
```

## MVC Pattern Erklärung

### 1. **Models** (`src/models/`)
- **Zweck**: Definieren die Datenstrukturen
- **Inhalt**: TypeScript Interfaces für Student, Course, Lecturer, Enrollment
- **Beispiel**: `Student.ts` definiert die Student-Interface

### 2. **Views** (`src/views/`)
- **Zweck**: UI-Komponenten und Benutzeroberfläche
- **Inhalt**: React-Komponenten für die Darstellung
- **Beispiel**: `Dashboard.tsx`, `StudentList.tsx`, `StudentForm.tsx`

### 3. **Controllers** (`src/controllers/`)
- **Zweck**: Business Logic und Koordination zwischen Model und View
- **Inhalt**: Klassen die die Anwendungslogik verwalten
- **Beispiel**: `StudentController.ts` verwaltet Student-Operationen

### 4. **Database** (`src/database/`)
- **Zweck**: Datenbankzugriff und Datenoperationen (Services)
- **Inhalt**: Services für CRUD-Operationen mit Supabase
- **Beispiel**: `StudentService.ts` für Datenbank-Operationen
- **Features**: Singleton-Pattern, Validation, Error Handling

## Services vs Database Layer

Die **Services** sind jetzt im `database/` Ordner und fungieren als **Database Layer**:

- ✅ **Vollständige CRUD-Operationen**
- ✅ **Business Logic Validation**
- ✅ **Singleton-Pattern** für einfache Nutzung
- ✅ **Error Handling**
- ✅ **Supabase Integration**

### Beispiel Service-Nutzung:
```typescript
import { studentService } from '@/database'

// Singleton verwenden
const students = await studentService.getAllStudents()

// Oder Klasse instanziieren
import { StudentService } from '@/database'
const service = new StudentService()
```

## Datenfluss

```
View (UI) → Controller (Logic) → Database (Data) → Supabase
    ↑                                                    ↓
    ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

1. **User Interaction**: Benutzer interagiert mit der View
2. **Controller**: View ruft Controller-Methode auf
3. **Database Service**: Controller ruft Database Service auf
4. **Supabase**: Service führt Datenbankoperation aus
5. **Response**: Daten fließen zurück zur View

## Beispiel-Implementierung

### Model (Student.ts)
```typescript
export interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  student_number: string
  created_at: string
  updated_at: string
}
```

### Database Service (StudentService.ts)
```typescript
export class StudentService {
  async getAllStudents(): Promise<Student[]> {
    // Supabase Datenbankzugriff
  }
  
  async createStudent(data: StudentData): Promise<Student> {
    // Validation + Database Insert
  }
}
```

### Controller (StudentController.ts)
```typescript
export class StudentController {
  private studentService: StudentService

  async getAllStudents(): Promise<Student[]> {
    return await this.studentService.getAllStudents()
  }
  
  async createStudent(data: StudentData): Promise<Student> {
    return await this.studentService.createStudent(data)
  }
}
```

### View (StudentList.tsx)
```typescript
export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([])
  const studentController = new StudentController()

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    const data = await studentController.getAllStudents()
    setStudents(data)
  }

  return (
    // UI Rendering
  )
}
```

## Vorteile dieser Struktur

### ✅ Klare Trennung
- Jeder Ordner hat eine spezifische Verantwortung
- Code ist logisch organisiert
- Einfach zu navigieren

### ✅ Skalierbarkeit
- Neue Features können einfach hinzugefügt werden
- Jede Schicht kann unabhängig erweitert werden
- Modularer Aufbau

### ✅ Wartbarkeit
- Änderungen sind isoliert
- Code ist vorhersagbar strukturiert
- Debugging ist einfacher

### ✅ Testbarkeit
- Jede Schicht kann separat getestet werden
- Services sind mockbar
- Controller-Logic ist isoliert

## Verwendung

### Neuen Controller hinzufügen:
1. Erstelle neue Datei in `src/controllers/`
2. Implementiere entsprechenden Database Service
3. Definiere Model-Interface
4. Verwende Controller in Views

### Neue View hinzufügen:
1. Erstelle Komponente in `src/views/components/`
2. Verwende entsprechenden Controller
3. Importiere benötigte Models

### Neue Database Operation:
1. Erweitere Service in `src/database/`
2. Füge Controller-Methode hinzu
3. Verwende in View-Komponente

Diese Struktur bietet eine saubere, professionelle MVC-Architektur die einfach zu verstehen und zu erweitern ist.