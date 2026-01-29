import { Student, Lecturer, Course, Enrollment } from '@/types/database'

// Base CRUD interface (Interface Segregation Principle)
export interface BaseRepository<T, TInsert, TUpdate> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: TInsert): Promise<T>
  update(id: string, data: TUpdate): Promise<T>
  delete(id: string): Promise<void>
}

// Specific repository interfaces
export interface IStudentRepository extends BaseRepository<Student, Omit<Student, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<Student, 'id' | 'created_at'>>> {
  findByEmail(email: string): Promise<Student | null>
  findByStudentNumber(studentNumber: string): Promise<Student | null>
}

export interface ILecturerRepository extends BaseRepository<Lecturer, Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<Lecturer, 'id' | 'created_at'>>> {
  findByEmail(email: string): Promise<Lecturer | null>
  findByDepartment(department: string): Promise<Lecturer[]>
}

export interface ICourseRepository extends BaseRepository<Course, Omit<Course, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<Course, 'id' | 'created_at'>>> {
  findByLecturerId(lecturerId: string): Promise<Course[]>
  findAvailableCourses(): Promise<Course[]>
}

export interface IEnrollmentRepository extends BaseRepository<Enrollment, Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>, Partial<Omit<Enrollment, 'id' | 'created_at'>>> {
  findByStudentId(studentId: string): Promise<Enrollment[]>
  findByCourseId(courseId: string): Promise<Enrollment[]>
  findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null>
  countByCourseId(courseId: string): Promise<number>
}

// Service interfaces (Single Responsibility Principle)
export interface IStudentService {
  getAllStudents(): Promise<Student[]>
  getStudentById(id: string): Promise<Student | null>
  createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student>
  updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student>
  deleteStudent(id: string): Promise<void>
  getStudentByEmail(email: string): Promise<Student | null>
}

export interface ICourseService {
  getAllCourses(): Promise<Course[]>
  getCourseById(id: string): Promise<Course | null>
  createCourse(data: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course>
  updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course>
  deleteCourse(id: string): Promise<void>
  getCoursesByLecturer(lecturerId: string): Promise<Course[]>
  getAvailableCourses(): Promise<Course[]>
}

export interface IEnrollmentService {
  enrollStudent(studentId: string, courseId: string): Promise<Enrollment>
  unenrollStudent(studentId: string, courseId: string): Promise<void>
  getStudentEnrollments(studentId: string): Promise<Enrollment[]>
  getCourseEnrollments(courseId: string): Promise<Enrollment[]>
  isStudentEnrolled(studentId: string, courseId: string): Promise<boolean>
  canEnrollInCourse(courseId: string): Promise<boolean>
}

export interface ILecturerService {
  getAllLecturers(): Promise<Lecturer[]>
  getLecturerById(id: string): Promise<Lecturer | null>
  createLecturer(data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>): Promise<Lecturer>
  updateLecturer(id: string, data: Partial<Omit<Lecturer, 'id' | 'created_at'>>): Promise<Lecturer>
  deleteLecturer(id: string): Promise<void>
}

// Error types
export class ServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'ServiceError'
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND')
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message, 'CONFLICT')
  }
}