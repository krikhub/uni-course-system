import { Student } from '@/models/Student'
import { StudentService } from '@/database/StudentService'

export class StudentController {
  private studentService: StudentService

  constructor() {
    this.studentService = new StudentService()
  }

  async getAllStudents(): Promise<Student[]> {
    return await this.studentService.getAllStudents()
  }

  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    return await this.studentService.createStudent(studentData)
  }

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    return await this.studentService.updateStudent(id, studentData)
  }

  async deleteStudent(id: string): Promise<void> {
    return await this.studentService.deleteStudent(id)
  }

  async getStudentById(id: string): Promise<Student | null> {
    return await this.studentService.getStudentById(id)
  }
}