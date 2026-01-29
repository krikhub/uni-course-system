import { supabase } from '@/lib/supabase'
import { Lecturer } from '@/types/database'

/**
 * LecturerService - Vereinfachte Version
 * 
 * SOLID-Prinzipien die BEIBEHALTEN werden:
 * - Single Responsibility: Nur Lecturer-bezogene Operationen
 * - Open/Closed: Erweiterbar für neue Lecturer-Features
 */
export class LecturerService {
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async getAllLecturers(): Promise<Lecturer[]> {
    const { data, error } = await supabase
      .from('lecturers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch lecturers: ${error.message}`)
    return data || []
  }

  async getLecturerById(id: string): Promise<Lecturer | null> {
    const { data, error } = await supabase
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

  async createLecturer(data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>): Promise<Lecturer> {
    // Business Logic Validation
    if (!data.email || !data.first_name || !data.last_name || !data.department) {
      throw new Error('All required fields must be provided')
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Check for existing email
    const { data: existingByEmail } = await supabase
      .from('lecturers')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingByEmail) {
      throw new Error('Lecturer with this email already exists')
    }

    const { data: lecturer, error } = await supabase
      .from('lecturers')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create lecturer: ${error.message}`)
    return lecturer
  }

  async updateLecturer(id: string, data: Partial<Omit<Lecturer, 'id' | 'created_at'>>): Promise<Lecturer> {
    // Check if lecturer exists
    const existing = await this.getLecturerById(id)
    if (!existing) {
      throw new Error(`Lecturer with id ${id} not found`)
    }

    // Validate email if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Check for email conflicts
    if (data.email && data.email !== existing.email) {
      const { data: existingByEmail } = await supabase
        .from('lecturers')
        .select('id')
        .eq('email', data.email)
        .single()

      if (existingByEmail) {
        throw new Error('Lecturer with this email already exists')
      }
    }

    const { data: lecturer, error } = await supabase
      .from('lecturers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update lecturer: ${error.message}`)
    return lecturer
  }

  async deleteLecturer(id: string): Promise<void> {
    const existing = await this.getLecturerById(id)
    if (!existing) {
      throw new Error(`Lecturer with id ${id} not found`)
    }

    // Check if lecturer has courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('lecturer_id', id)
      .limit(1)

    if (coursesError) {
      throw new Error(`Failed to check lecturer courses: ${coursesError.message}`)
    }

    if (courses && courses.length > 0) {
      throw new Error('Cannot delete lecturer with existing courses')
    }

    const { error } = await supabase
      .from('lecturers')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete lecturer: ${error.message}`)
  }

  async getLecturersByDepartment(department: string): Promise<Lecturer[]> {
    const { data, error } = await supabase
      .from('lecturers')
      .select('*')
      .eq('department', department)
      .order('last_name', { ascending: true })

    if (error) throw new Error(`Failed to fetch lecturers by department: ${error.message}`)
    return data || []
  }
}

export const lecturerService = new LecturerService()