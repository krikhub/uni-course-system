import { Enrollment } from '@/models/Enrollment'
import { EnrollmentService } from '@/database/EnrollmentService'

export class EnrollmentController {
  private enrollmentService: EnrollmentService

  constructor() {
    this.enrollmentService = new EnrollmentService()
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return await this.enrollmentService.getAllEnrollments()
  }

  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    return await this.enrollmentService.enrollStudent(studentId, courseId)
  }

  async unenrollStudent(enrollmentId: string): Promise<void> {
    return await this.enrollmentService.unenrollStudent(enrollmentId)
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return await this.enrollmentService.getEnrollmentsByStudent(studentId)
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return await this.enrollmentService.getEnrollmentsByCourse(courseId)
  }
}