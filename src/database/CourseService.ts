import { supabase } from '@/lib/supabase'
import { Course } from '@/models/Course'

/**
 * CourseService - Vereinfachte Version
 * 
 * SOLID-Prinzipien die BEIBEHALTEN werden:
 * - Single Responsibility: Nur Course-bezogene Operationen
 * - Open/Closed: Erweiterbar für neue Course-Features
 */
export class CourseService {
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch courses: ${error.message}`)
    return data || []
  }

  async getCourseById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch course: ${error.message}`)
    }
    return data
  }

  async createCourse(data: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    // Business Logic Validation
    if (!data.title || !data.lecturer_id || !data.max_participants || !data.start_date || !data.end_date) {
      throw new Error('All required fields must be provided')
    }

    if (data.max_participants <= 0) {
      throw new Error('Max participants must be greater than 0')
    }

    // Validate dates
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date')
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past')
    }

    // Check if lecturer exists
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturers')
      .select('id')
      .eq('id', data.lecturer_id)
      .single()

    if (lecturerError || !lecturer) {
      throw new Error('Lecturer not found')
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert(data)
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .single()

    if (error) throw new Error(`Failed to create course: ${error.message}`)
    return course
  }

  async updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course> {
    // Check if course exists
    const existing = await this.getCourseById(id)
    if (!existing) {
      throw new Error(`Course with id ${id} not found`)
    }

    // Validate dates if provided
    if (data.start_date || data.end_date) {
      const startDate = new Date(data.start_date || existing.start_date)
      const endDate = new Date(data.end_date || existing.end_date)
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date')
      }
    }

    // Validate max_participants if provided
    if (data.max_participants !== undefined && data.max_participants <= 0) {
      throw new Error('Max participants must be greater than 0')
    }

    // Check if lecturer exists if provided
    if (data.lecturer_id) {
      const { data: lecturer, error: lecturerError } = await supabase
        .from('lecturers')
        .select('id')
        .eq('id', data.lecturer_id)
        .single()

      if (lecturerError || !lecturer) {
        throw new Error('Lecturer not found')
      }
    }

    const { data: course, error } = await supabase
      .from('courses')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .single()

    if (error) throw new Error(`Failed to update course: ${error.message}`)
    return course
  }

  async deleteCourse(id: string): Promise<void> {
    const existing = await this.getCourseById(id)
    if (!existing) {
      throw new Error(`Course with id ${id} not found`)
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete course: ${error.message}`)
  }

  async getCoursesByLecturer(lecturerId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .eq('lecturer_id', lecturerId)
      .order('start_date', { ascending: true })

    if (error) throw new Error(`Failed to fetch courses by lecturer: ${error.message}`)
    return data || []
  }

  async getAvailableCourses(): Promise<Course[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lecturer:lecturers(first_name, last_name)
      `)
      .gte('start_date', now)
      .order('start_date', { ascending: true })

    if (error) throw new Error(`Failed to fetch available courses: ${error.message}`)
    return data || []
  }
}

export const courseService = new CourseService()