export interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  student_number: string
  created_at: string
  updated_at: string
}

export interface Lecturer {
  id: string
  first_name: string
  last_name: string
  email: string
  department: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  lecturer_id: string
  max_participants: number
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrollment_date: string
  created_at: string
  updated_at: string
}

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