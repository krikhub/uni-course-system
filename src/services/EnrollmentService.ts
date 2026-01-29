import { supabase } from '@/lib/supabase'
import { Enrollment } from '@/types/database'

/**
 * EnrollmentService - Vereinfachte Version
 * 
 * SOLID-Prinzipien die BEIBEHALTEN werden:
 * - Single Responsibility: Nur Enrollment-bezogene Operationen
 * - Open/Closed: Erweiterbar für neue Enrollment-Features
 */
export class EnrollmentService {
  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      throw new Error('Student not found')
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, max_participants')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      throw new Error('Course not found')
    }

    // Check if already enrolled
    const existing = await this.isStudentEnrolled(studentId, courseId)
    if (existing) {
      throw new Error('Student is already enrolled in this course')
    }

    // Check if course has capacity
    const canEnroll = await this.canEnrollInCourse(courseId)
    if (!canEnroll) {
      throw new Error('Course is full')
    }

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId,
        enrollment_date: new Date().toISOString()
      })
      .select(`
        *,
        student:students(first_name, last_name, email),
        course:courses(title, start_date, end_date)
      `)
      .single()

    if (error) throw new Error(`Failed to enroll student: ${error.message}`)
    return enrollment
  }

  async unenrollStudent(studentId: string, courseId: string): Promise<void> {
    const { data: enrollment, error: findError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (findError || !enrollment) {
      throw new Error('Enrollment not found')
    }

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('student_id', studentId)
      .eq('course_id', courseId)

    if (error) throw new Error(`Failed to unenroll student: ${error.message}`)
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          title,
          start_date,
          end_date,
          lecturer:lecturers(first_name, last_name)
        )
      `)
      .eq('student_id', studentId)
      .order('enrollment_date', { ascending: false })

    if (error) throw new Error(`Failed to fetch student enrollments: ${error.message}`)
    return data || []
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:students(first_name, last_name, email, student_number)
      `)
      .eq('course_id', courseId)
      .order('enrollment_date', { ascending: false })

    if (error) throw new Error(`Failed to fetch course enrollments: ${error.message}`)
    return data || []
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check enrollment: ${error.message}`)
    }

    return !!data
  }

  async canEnrollInCourse(courseId: string): Promise<boolean> {
    // Get course max participants
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('max_participants')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      throw new Error('Course not found')
    }

    // Count current enrollments
    const { count, error: countError } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (countError) {
      throw new Error(`Failed to count enrollments: ${countError.message}`)
    }

    return (count || 0) < course.max_participants
  }

  async getEnrollmentCount(courseId: string): Promise<number> {
    const { count, error } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (error) throw new Error(`Failed to count enrollments: ${error.message}`)
    return count || 0
  }
}

export const enrollmentService = new EnrollmentService()