import { Course } from '@/types/database'
import { ICourseService, ICourseRepository, ILecturerRepository, ValidationError, NotFoundError } from '@/models/interfaces'

export class CourseService implements ICourseService {
  constructor(
    private courseRepository: ICourseRepository,
    private lecturerRepository: ILecturerRepository
  ) {}

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.findAll()
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.courseRepository.findById(id)
  }

  async createCourse(data: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    // Validation
    if (!data.title || !data.lecturer_id || !data.max_participants || !data.start_date || !data.end_date) {
      throw new ValidationError('All required fields must be provided')
    }

    if (data.max_participants <= 0) {
      throw new ValidationError('Max participants must be greater than 0')
    }

    // Validate dates
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    
    if (startDate >= endDate) {
      throw new ValidationError('End date must be after start date')
    }

    if (startDate < new Date()) {
      throw new ValidationError('Start date cannot be in the past')
    }

    // Check if lecturer exists
    const lecturer = await this.lecturerRepository.findById(data.lecturer_id)
    if (!lecturer) {
      throw new ValidationError('Lecturer not found')
    }

    return this.courseRepository.create(data)
  }

  async updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course> {
    // Check if course exists
    const existing = await this.courseRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Course', id)
    }

    // Validate max participants if provided
    if (data.max_participants !== undefined && data.max_participants <= 0) {
      throw new ValidationError('Max participants must be greater than 0')
    }

    // Validate dates if provided
    if (data.start_date || data.end_date) {
      const startDate = new Date(data.start_date || existing.start_date)
      const endDate = new Date(data.end_date || existing.end_date)
      
      if (startDate >= endDate) {
        throw new ValidationError('End date must be after start date')
      }
    }

    // Check if lecturer exists if provided
    if (data.lecturer_id) {
      const lecturer = await this.lecturerRepository.findById(data.lecturer_id)
      if (!lecturer) {
        throw new ValidationError('Lecturer not found')
      }
    }

    return this.courseRepository.update(id, data)
  }

  async deleteCourse(id: string): Promise<void> {
    const existing = await this.courseRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Course', id)
    }

    await this.courseRepository.delete(id)
  }

  async getCoursesByLecturer(lecturerId: string): Promise<Course[]> {
    // Check if lecturer exists
    const lecturer = await this.lecturerRepository.findById(lecturerId)
    if (!lecturer) {
      throw new NotFoundError('Lecturer', lecturerId)
    }

    return this.courseRepository.findByLecturerId(lecturerId)
  }

  async getAvailableCourses(): Promise<Course[]> {
    return this.courseRepository.findAvailableCourses()
  }
}