import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Lecturer } from '@/types/database'
import { ILecturerRepository } from '@/models/interfaces'

export class LecturerRepository implements ILecturerRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findAll(): Promise<Lecturer[]> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch lecturers: ${error.message}`)
    return data || []
  }

  async findById(id: string): Promise<Lecturer | null> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch lecturer: ${error.message}`)
    }
    return data
  }

  async create(data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>): Promise<Lecturer> {
    const { data: lecturer, error } = await this.supabase
      .from('lecturers')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create lecturer: ${error.message}`)
    return lecturer
  }

  async update(id: string, data: Partial<Omit<Lecturer, 'id' | 'created_at'>>): Promise<Lecturer> {
    const { data: lecturer, error } = await this.supabase
      .from('lecturers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update lecturer: ${error.message}`)
    return lecturer
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('lecturers')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete lecturer: ${error.message}`)
  }

  async findByEmail(email: string): Promise<Lecturer | null> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch lecturer by email: ${error.message}`)
    }
    return data
  }

  async findByDepartment(department: string): Promise<Lecturer[]> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch lecturers by department: ${error.message}`)
    return data || []
  }
}