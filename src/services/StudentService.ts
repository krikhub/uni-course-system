import { Student } from '@/types/database'
import { IStudentService, IStudentRepository, ValidationError, NotFoundError } from '@/models/interfaces'

export class StudentService implements IStudentService {
  constructor(private studentRepository: IStudentRepository) {}

  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.findAll()
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.studentRepository.findById(id)
  }

  async createStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    // Validation
    if (!data.email || !data.first_name || !data.last_name || !data.student_number) {
      throw new ValidationError('All required fields must be provided')
    }

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format')
    }

    // Check for existing email
    const existingByEmail = await this.studentRepository.findByEmail(data.email)
    if (existingByEmail) {
      throw new ValidationError('Student with this email already exists')
    }

    // Check for existing student number
    const existingByNumber = await this.studentRepository.findByStudentNumber(data.student_number)
    if (existingByNumber) {
      throw new ValidationError('Student with this student number already exists')
    }

    return this.studentRepository.create(data)
  }

  async updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
    // Check if student exists
    const existing = await this.studentRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Student', id)
    }

    // Validate email if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format')
    }

    // Check for email conflicts
    if (data.email && data.email !== existing.email) {
      const existingByEmail = await this.studentRepository.findByEmail(data.email)
      if (existingByEmail) {
        throw new ValidationError('Student with this email already exists')
      }
    }

    // Check for student number conflicts
    if (data.student_number && data.student_number !== existing.student_number) {
      const existingByNumber = await this.studentRepository.findByStudentNumber(data.student_number)
      if (existingByNumber) {
        throw new ValidationError('Student with this student number already exists')
      }
    }

    return this.studentRepository.update(id, data)
  }

  async deleteStudent(id: string): Promise<void> {
    const existing = await this.studentRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Student', id)
    }

    await this.studentRepository.delete(id)
  }

  async getStudentByEmail(email: string): Promise<Student | null> {
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    return this.studentRepository.findByEmail(email)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}