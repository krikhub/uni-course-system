import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Course } from '@/types/database'
import { ICourseRepository } from '@/models/interfaces'

export class CourseRepository implements ICourseRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findAll(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch courses: ${error.message}`)
    return data || []
  }

  async findById(id: string): Promise<Course | null> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch course: ${error.message}`)
    }
    return data
  }

  async create(data: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data: course, error } = await this.supabase
      .from('courses')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create course: ${error.message}`)
    return course
  }

  async update(id: string, data: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course> {
    const { data: course, error } = await this.supabase
      .from('courses')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update course: ${error.message}`)
    return course
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete course: ${error.message}`)
  }

  async findByLecturerId(lecturerId: string): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('lecturer_id', lecturerId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch courses by lecturer: ${error.message}`)
    return data || []
  }

  async findAvailableCourses(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        enrollments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch available courses: ${error.message}`)
    
    // Filter courses that have space available
    return (data || []).filter((course: any) => {
      const enrollmentCount = course.enrollments?.[0]?.count || 0
      return enrollmentCount < course.max_participants
    })
  }
}