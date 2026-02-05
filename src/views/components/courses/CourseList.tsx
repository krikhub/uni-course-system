'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/models/Course'
import { courseService, lecturerService, enrollmentService } from '@/database'

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Einschreiben des Studenten'
      setError(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Kurse werden geladen...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Fehler</div>
        <div className="text-red-600">{error}</div>
        <button 
          onClick={loadCourses}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Kurse</h3>
      </div>
      
      {courses.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Keine Kurse gefunden
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dozent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Termine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapazität
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500">{course.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.lecturer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(course.start_date)} - {formatDate(course.end_date)}
                      {course.is_expired && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Abgelaufen
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.enrollment_count} / {course.max_participants}
                      {course.is_full && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Voll
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {showEnrollmentActions && selectedStudentId && !course.is_full && !course.is_expired && (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Einschreiben
                      </button>
                    )}
                    {showEnrollmentActions && selectedStudentId && (course.is_full || course.is_expired) && (
                      <span className="text-gray-400">
                        {course.is_expired ? 'Abgelaufen' : 'Voll'}
                      </span>
                    )}
                    {onCourseSelect && (
                      <button
                        onClick={() => onCourseSelect(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Auswählen
                      </button>
                    )}
                    {onCourseEdit && (
                      <button
                        onClick={() => onCourseEdit(course)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Bearbeiten
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}