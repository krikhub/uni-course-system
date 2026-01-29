import { Enrollment } from '@/types/database'
import { 
  IEnrollmentService, 
  IEnrollmentRepository, 
  IStudentRepository, 
  ICourseRepository,
  ValidationError, 
  NotFoundError, 
  ConflictError 
} from '@/models/interfaces'

export class EnrollmentService implements IEnrollmentService {
  constructor(
    private enrollmentRepository: IEnrollmentRepository,
    private studentRepository: IStudentRepository,
    private courseRepository: ICourseRepository
  ) {}

  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    // Check if student exists
    const student = await this.studentRepository.findById(studentId)
    if (!student) {
      throw new NotFoundError('Student', studentId)
    }

    // Check if course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course', courseId)
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId)
    if (existingEnrollment) {
      throw new ConflictError('Student is already enrolled in this course')
    }

    // Check if course has capacity
    const canEnroll = await this.canEnrollInCourse(courseId)
    if (!canEnroll) {
      throw new ConflictError('Course is full')
    }

    // Check if course has started
    const courseStartDate = new Date(course.start_date)
    if (courseStartDate < new Date()) {
      throw new ConflictError('Cannot enroll in a course that has already started')
    }

    return this.enrollmentRepository.create({
      student_id: studentId,
      course_id: courseId,
      enrollment_date: new Date().toISOString()
    })
  }

  async unenrollStudent(studentId: string, courseId: string): Promise<void> {
    // Check if enrollment exists
    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId)
    if (!enrollment) {
      throw new NotFoundError('Enrollment', `${studentId}-${courseId}`)
    }

    // Check if course has started (optional business rule)
    const course = await this.courseRepository.findById(courseId)
    if (course) {
      const courseStartDate = new Date(course.start_date)
      const now = new Date()
      const daysDifference = Math.ceil((courseStartDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      
      if (daysDifference < 7) {
        throw new ConflictError('Cannot unenroll less than 7 days before course start')
      }
    }

    await this.enrollmentRepository.delete(enrollment.id)
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    // Check if student exists
    const student = await this.studentRepository.findById(studentId)
    if (!student) {
      throw new NotFoundError('Student', studentId)
    }

    return this.enrollmentRepository.findByStudentId(studentId)
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    // Check if course exists
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new NotFoundError('Course', courseId)
    }

    return this.enrollmentRepository.findByCourseId(courseId)
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(studentId, courseId)
    return enrollment !== null
  }

  async canEnrollInCourse(courseId: string): Promise<boolean> {
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      return false
    }

    const enrollmentCount = await this.enrollmentRepository.countByCourseId(courseId)
    return enrollmentCount < course.max_participants
  }
}