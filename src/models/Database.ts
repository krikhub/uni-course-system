import { Student } from './Student'
import { Course } from './Course'
import { Lecturer } from './Lecturer'
import { Enrollment } from './Enrollment'

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Student, 'id' | 'created_at'>>
      }
      lecturers: {
        Row: Lecturer
        Insert: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lecturer, 'id' | 'created_at'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Course, 'id' | 'created_at'>>
      }
      enrollments: {
        Row: Enrollment
        Insert: Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Enrollment, 'id' | 'created_at'>>
      }
    }
  }
}