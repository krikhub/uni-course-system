import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Student } from '@/types/database'
import { IStudentRepository } from '@/models/interfaces'

export class StudentRepository implements IStudentRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findAll(): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch students: ${error.message}`)
    return data || []
  }

  async findById(id: string): Promise<Student | null> {
    const { data, error } = await this.supabase
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

  async create(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    console.log('Creating student with data:', data)
    
    const { data: student, error } = await this.supabase
      .from('students')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Supabase create error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to create student: ${error.message} (Code: ${error.code})`)
    }
    
    console.log('Student created successfully:', student)
    return student
  }

  async update(id: string, data: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
    const { data: student, error } = await this.supabase
      .from('students')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update student: ${error.message}`)
    return student
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete student: ${error.message}`)
  }

  async findByEmail(email: string): Promise<Student | null> {
    const { data, error } = await this.supabase
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

  async findByStudentNumber(studentNumber: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('student_number', studentNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch student by student number: ${error.message}`)
    }
    return data
  }
}