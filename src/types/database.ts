export interface Student {
  id: string
  name: string
  email: string
}

export interface Lecturer {
  id: string
  name: string
  email: string
}

export interface Course {
  id: string
  lecturer_id: string | null
  title: string
  max_participants: number
}

export interface Enrollment {
  student_id: string
  course_id: string
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student
        Insert: Omit<Student, 'id'> & { id?: string }
        Update: Partial<Omit<Student, 'id'>>
      }
      lecturers: {
        Row: Lecturer
        Insert: Omit<Lecturer, 'id'> & { id?: string }
        Update: Partial<Omit<Lecturer, 'id'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id'> & { id?: string }
        Update: Partial<Omit<Course, 'id'>>
      }
      enrollments: {
        Row: Enrollment
        Insert: Enrollment
        Update: Partial<Enrollment>
      }
    }
  }
}