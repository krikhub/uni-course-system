// Database Services - Singleton-Instanzen für einfache Nutzung

export { studentService } from './StudentService'
export { courseService } from './CourseService'
export { enrollmentService } from './EnrollmentService'
export { lecturerService } from './LecturerService'

// Re-export der Service-Klassen für erweiterte Nutzung falls nötig
export { StudentService } from './StudentService'
export { CourseService } from './CourseService'
export { EnrollmentService } from './EnrollmentService'
export { LecturerService } from './LecturerService'