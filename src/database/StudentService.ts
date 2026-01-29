import { supabase } from '@/lib/supabase'
import { Student } from '@/models/Student'

/**
 * StudentService - Database Layer für Student-Operationen
 * 
 * SOLID-Prinzipien:
 * - Single Responsibility: Nur Student-bezogene Datenbankoperationen
 * - Open/Closed: Erweiterbar für neue Student-Features
 */
export class StudentService {
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async getAllStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch students: ${error.message}`)
    return data || []
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch student: ${error.message}`)
    }
    return data
  }

  async createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    // Business Logic Validation
    if (!data.email || !data.first_name || !data.last_name || !data.student_number) {
      throw new Error('All required fields must be provided')
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Check for existing email
    const { data: existingByEmail } = await supabase
      .from('students')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingByEmail) {
      throw new Error('Student with this email already exists')
    }

    // Check for existing student number
    const { data: existingByNumber } = await supabase
      .from('students')
      .select('id')
      .eq('student_number', data.student_number)
      .single()

    if (existingByNumber) {
      throw new Error('Student with this student number already exists')
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create student: ${error.message}`)
    return student
  }

  async updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
    // Check if student exists
    const existing = await this.getStudentById(id)
    if (!existing) {
      throw new Error(`Student with id ${id} not found`)
    }

    // Validate email if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Check for email conflicts
    if (data.email && data.email !== existing.email) {
      const { data: existingByEmail } = await supabase
        .from('students')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingByEmail) {
        throw new Error('Student with this email already exists')
      }
    }

    // Check for student number conflicts
    if (data.student_number && data.student_number !== existing.student_number) {
      const { data: existingByNumber } = await supabase
        .from('students')
        .select('id')
        .eq('student_number', data.student_number)
        .single()

      if (existingByNumber) {
        throw new Error('Student with this student number already exists')
      }
    }

    const { data: student, error } = await supabase
      .from('students')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update student: ${error.message}`)
    return student
  }

  async deleteStudent(id: string): Promise<void> {
    const existing = await this.getStudentById(id)
    if (!existing) {
      throw new Error(`Student with id ${id} not found`)
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete student: ${error.message}`)
  }

  async getStudentByEmail(email: string): Promise<Student | null> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch student by email: ${error.message}`)
    }
    return data
  }
}

// Singleton-Pattern für einfache Nutzung
export const studentService = new StudentService()