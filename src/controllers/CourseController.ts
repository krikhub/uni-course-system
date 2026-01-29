import { Course } from '@/models/Course'
import { CourseService } from '@/database/CourseService'

export class CourseController {
  private courseService: CourseService

  constructor() {
    this.courseService = new CourseService()
  }

  async getAllCourses(): Promise<Course[]> {
    return await this.courseService.getAllCourses()
  }

  async createCourse(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    return await this.courseService.createCourse(courseData)
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    return await this.courseService.updateCourse(id, courseData)
  }

  async deleteCourse(id: string): Promise<void> {
    return await this.courseService.deleteCourse(id)
  }

  async getCourseById(id: string): Promise<Course | null> {
    return await this.courseService.getCourseById(id)
  }
}