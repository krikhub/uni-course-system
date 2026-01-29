import { Lecturer } from '@/types/database'
import { ILecturerService, ILecturerRepository, ValidationError, NotFoundError } from '@/models/interfaces'

export class LecturerService implements ILecturerService {
  constructor(private lecturerRepository: ILecturerRepository) {}

  async getAllLecturers(): Promise<Lecturer[]> {
    return this.lecturerRepository.findAll()
  }

  async getLecturerById(id: string): Promise<Lecturer | null> {
    return this.lecturerRepository.findById(id)
  }

  async createLecturer(data: Omit<Lecturer, 'id' | 'created_at' | 'updated_at'>): Promise<Lecturer> {
    // Validation
    if (!data.email || !data.first_name || !data.last_name || !data.department) {
      throw new ValidationError('All required fields must be provided')
    }

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format')
    }

    // Check for existing email
    const existingByEmail = await this.lecturerRepository.findByEmail(data.email)
    if (existingByEmail) {
      throw new ValidationError('Lecturer with this email already exists')
    }

    return this.lecturerRepository.create(data)
  }

  async updateLecturer(id: string, data: Partial<Omit<Lecturer, 'id' | 'created_at'>>): Promise<Lecturer> {
    // Check if lecturer exists
    const existing = await this.lecturerRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Lecturer', id)
    }

    // Validate email if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format')
    }

    // Check for email conflicts
    if (data.email && data.email !== existing.email) {
      const existingByEmail = await this.lecturerRepository.findByEmail(data.email)
      if (existingByEmail) {
        throw new ValidationError('Lecturer with this email already exists')
      }
    }

    return this.lecturerRepository.update(id, data)
  }

  async deleteLecturer(id: string): Promise<void> {
    const existing = await this.lecturerRepository.findById(id)
    if (!existing) {
      throw new NotFoundError('Lecturer', id)
    }

    await this.lecturerRepository.delete(id)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}