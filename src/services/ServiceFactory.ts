import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { supabase } from '@/lib/supabase'

// Repositories
import { StudentRepository } from './repositories/StudentRepository'
import { LecturerRepository } from './repositories/LecturerRepository'
import { CourseRepository } from './repositories/CourseRepository'
import { EnrollmentRepository } from './repositories/EnrollmentRepository'

// Services
import { StudentService } from './StudentService'
import { LecturerService } from './LecturerService'
import { CourseService } from './CourseService'
import { EnrollmentService } from './EnrollmentService'

// Interfaces
import {
  IStudentRepository,
  ILecturerRepository,
  ICourseRepository,
  IEnrollmentRepository,
  IStudentService,
  ILecturerService,
  ICourseService,
  IEnrollmentService
} from '@/models/interfaces'

/**
 * Service Factory implementing Dependency Inversion Principle
 * Provides centralized dependency injection for the application
 */
export class ServiceFactory {
  private static instance: ServiceFactory
  private supabaseClient: SupabaseClient<Database>

  // Repository instances
  private studentRepository: IStudentRepository
  private lecturerRepository: ILecturerRepository
  private courseRepository: ICourseRepository
  private enrollmentRepository: IEnrollmentRepository

  // Service instances
  private studentService: IStudentService
  private lecturerService: ILecturerService
  private courseService: ICourseService
  private enrollmentService: IEnrollmentService

  private constructor(supabaseClient?: SupabaseClient<Database>) {
    this.supabaseClient = supabaseClient || supabase
    this.initializeRepositories()
    this.initializeServices()
  }

  public static getInstance(supabaseClient?: SupabaseClient<Database>): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(supabaseClient)
    }
    return ServiceFactory.instance
  }

  private initializeRepositories(): void {
    this.studentRepository = new StudentRepository(this.supabaseClient)
    this.lecturerRepository = new LecturerRepository(this.supabaseClient)
    this.courseRepository = new CourseRepository(this.supabaseClient)
    this.enrollmentRepository = new EnrollmentRepository(this.supabaseClient)
  }

  private initializeServices(): void {
    this.studentService = new StudentService(this.studentRepository)
    this.lecturerService = new LecturerService(this.lecturerRepository)
    this.courseService = new CourseService(this.courseRepository, this.lecturerRepository)
    this.enrollmentService = new EnrollmentService(
      this.enrollmentRepository,
      this.studentRepository,
      this.courseRepository
    )
  }

  // Repository getters
  public getStudentRepository(): IStudentRepository {
    return this.studentRepository
  }

  public getLecturerRepository(): ILecturerRepository {
    return this.lecturerRepository
  }

  public getCourseRepository(): ICourseRepository {
    return this.courseRepository
  }

  public getEnrollmentRepository(): IEnrollmentRepository {
    return this.enrollmentRepository
  }

  // Service getters
  public getStudentService(): IStudentService {
    return this.studentService
  }

  public getLecturerService(): ILecturerService {
    return this.lecturerService
  }

  public getCourseService(): ICourseService {
    return this.courseService
  }

  public getEnrollmentService(): IEnrollmentService {
    return this.enrollmentService
  }

  // For testing - allows injection of mock dependencies
  public static createForTesting(
    studentRepo: IStudentRepository,
    lecturerRepo: ILecturerRepository,
    courseRepo: ICourseRepository,
    enrollmentRepo: IEnrollmentRepository
  ): ServiceFactory {
    const factory = new ServiceFactory()
    factory.studentRepository = studentRepo
    factory.lecturerRepository = lecturerRepo
    factory.courseRepository = courseRepo
    factory.enrollmentRepository = enrollmentRepo
    factory.initializeServices()
    return factory
  }
}

// Convenience functions for easy access
export const getStudentService = (): IStudentService => 
  ServiceFactory.getInstance().getStudentService()

export const getLecturerService = (): ILecturerService => 
  ServiceFactory.getInstance().getLecturerService()

export const getCourseService = (): ICourseService => 
  ServiceFactory.getInstance().getCourseService()

export const getEnrollmentService = (): IEnrollmentService => 
  ServiceFactory.getInstance().getEnrollmentService()