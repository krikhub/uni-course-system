'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/models/Course'
import { courseService, lecturerService, enrollmentService } from '@/database'
import CourseEnrollmentDetails from './CourseEnrollmentDetails'

interface CourseWithDetails extends Course {
  lecturer_name?: string
  enrollment_count?: number
  is_full?: boolean
  is_expired?: boolean
}

interface CourseListProps {
  onCourseSelect?: (course: Course) => void
  onCourseEdit?: (course: Course) => void
  onCourseDelete?: (courseId: string) => void
  showEnrollmentActions?: boolean
  selectedStudentId?: string
}

export default function CourseList({ 
  onCourseSelect, 
  onCourseEdit, 
  onCourseDelete,
  showEnrollmentActions = false,
  selectedStudentId
}: CourseListProps) {
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  // Verwende die importierten Service-Instanzen direkt

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [coursesData, lecturersData] = await Promise.all([
        courseService.getAllCourses(),
        lecturerService.getAllLecturers()
      ])

      // Enrich courses with lecturer names and enrollment counts
      const enrichedCourses = await Promise.all(
        coursesData.map(async (course) => {
          const lecturer = lecturersData.find(l => l.id === course.lecturer_id)
          const enrollmentCount = await enrollmentService.getCourseEnrollments(course.id)
          const currentDate = new Date()
          const courseEndDate = new Date(course.end_date)
          
          return {
            ...course,
            lecturer_name: lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : 'Unknown',
            enrollment_count: enrollmentCount.length,
            is_full: enrollmentCount.length >= course.max_participants,
            is_expired: courseEndDate < currentDate
          }
        })
      )

      setCourses(enrichedCourses)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Kurse'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kurs löschen möchten?')) return

    try {
      await courseService.deleteCourse(courseId)
      setCourses(courses.filter(c => c.id !== courseId))
      onCourseDelete?.(courseId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen des Kurses'
      setError(errorMessage)
    }
  }

  const handleEnroll = async (courseId: string) => {
    if (!selectedStudentId) return

    try {
      await enrollmentService.enrollStudent(selectedStudentId, courseId)
      await loadCourses() // Refresh to update enrollment counts
      // If this course is expanded, keep it expanded to show the updated list
      if (expandedCourse === courseId) {
        // The CourseEnrollmentDetails component will automatically refresh
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Einschreiben des Studenten'
      setError(errorMessage)
    }
  }

  const toggleCourseDetails = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-[#565D56]">
            <div className="w-5 h-5 border-2 border-[#C5CDC7] border-t-[#565D56] rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Kurse werden geladen...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-start gap-3 p-4 bg-[#383B39]/5 border border-[#9DA69F]/60 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-[#383B39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-[#383B39]">Fehler beim Laden</h4>
              <p className="text-sm text-[#565D56] mt-1">{error}</p>
              <button 
                onClick={loadCourses}
                className="mt-3 px-3 py-1.5 text-xs font-medium bg-[#383B39]/10 text-[#383B39] rounded-md hover:bg-[#383B39]/20 transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#383B39]">Kurse</h3>
            <p className="text-sm text-[#565D56] mt-1">{courses.length} Kurse verfügbar</p>
          </div>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="card-content">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-[#C5CDC7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h4 className="text-sm font-medium text-[#383B39] mb-1">Keine Kurse gefunden</h4>
            <p className="text-sm text-[#565D56]">Fügen Sie den ersten Kurs hinzu, um zu beginnen.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#C5CDC7]/40">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Dozent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Termine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Kapazität
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5CDC7]/30">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F0F4F1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#9DA69F]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#565D56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[#383B39] mb-1">{course.title}</div>
                          <div className="text-sm text-[#565D56] line-clamp-2">{course.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#565D56]">{course.lecturer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#565D56]">
                        <div>{formatDate(course.start_date)}</div>
                        <div className="text-xs text-[#9DA69F]">bis {formatDate(course.end_date)}</div>
                        {course.is_expired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#9DA69F]/20 text-[#565D56] mt-1">
                            Abgelaufen
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-[#565D56]">
                          {course.enrollment_count} / {course.max_participants}
                        </div>
                        {course.is_full && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#383B39]/10 text-[#383B39]">
                            Voll
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {showEnrollmentActions && selectedStudentId && !course.is_full && !course.is_expired && (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="px-3 py-1.5 text-xs font-medium text-[#565D56] bg-[#565D56]/10 hover:bg-[#565D56]/20 rounded-md transition-colors"
                          >
                            Einschreiben
                          </button>
                        )}
                        {showEnrollmentActions && selectedStudentId && (course.is_full || course.is_expired) && (
                          <span className="px-3 py-1.5 text-xs text-[#9DA69F]">
                            {course.is_expired ? 'Abgelaufen' : 'Voll'}
                          </span>
                        )}
                        {showEnrollmentActions && selectedStudentId && (
                          <button
                            onClick={() => toggleCourseDetails(course.id)}
                            className="px-3 py-1.5 text-xs font-medium text-[#9DA69F] bg-[#9DA69F]/10 hover:bg-[#9DA69F]/20 rounded-md transition-colors"
                          >
                            {expandedCourse === course.id ? 'Weniger' : 'Details'}
                          </button>
                        )}
                        {onCourseSelect && (
                          <button
                            onClick={() => onCourseSelect(course)}
                            className="px-3 py-1.5 text-xs font-medium text-[#565D56] bg-[#565D56]/10 hover:bg-[#565D56]/20 rounded-md transition-colors"
                          >
                            Auswählen
                          </button>
                        )}
                        {onCourseEdit && (
                          <button
                            onClick={() => onCourseEdit(course)}
                            className="px-3 py-1.5 text-xs font-medium text-[#565D56] bg-[#C5CDC7]/30 hover:bg-[#C5CDC7]/50 rounded-md transition-colors"
                          >
                            Bearbeiten
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="px-3 py-1.5 text-xs font-medium text-[#383B39] bg-[#383B39]/10 hover:bg-[#383B39]/20 rounded-md transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Show enrollment details for expanded course */}
      {showEnrollmentActions && selectedStudentId && expandedCourse && (
        <div className="mt-6">
          {(() => {
            const course = courses.find(c => c.id === expandedCourse)
            return course ? (
              <CourseEnrollmentDetails
                courseId={course.id}
                courseTitle={course.title}
                maxParticipants={course.max_participants}
              />
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}