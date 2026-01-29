import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Enrollment } from '@/types/database'
import { IEnrollmentRepository } from '@/models/interfaces'

export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findAll(): Promise<Enrollment[]> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch enrollments: ${error.message}`)
    return data || []
  }

  async findById(id: string): Promise<Enrollment | null> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch enrollment: ${error.message}`)
    }
    return data
  }

  async create(data: Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>): Promise<Enrollment> {
    const { data: enrollment, error } = await this.supabase
      .from('enrollments')
      .insert({
        ...data,
        enrollment_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create enrollment: ${error.message}`)
    return enrollment
  }

  async update(id: string, data: Partial<Omit<Enrollment, 'id' | 'created_at'>>): Promise<Enrollment> {
    const { data: enrollment, error } = await this.supabase
      .from('enrollments')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update enrollment: ${error.message}`)
    return enrollment
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('enrollments')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete enrollment: ${error.message}`)
  }

  async findByStudentId(studentId: string): Promise<Enrollment[]> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch enrollments by student: ${error.message}`)
    return data || []
  }

  async findByCourseId(courseId: string): Promise<Enrollment[]> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch enrollments by course: ${error.message}`)
    return data || []
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch enrollment: ${error.message}`)
    }
    return data
  }

  async countByCourseId(courseId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (error) throw new Error(`Failed to count enrollments: ${error.message}`)
    return count || 0
  }
}