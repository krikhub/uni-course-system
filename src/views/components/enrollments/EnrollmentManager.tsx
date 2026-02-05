'use client'

import { useState, useEffect } from 'react'
import { Student } from '@/models/Student'
import { Course } from '@/models/Course'
import { Enrollment } from '@/models/Enrollment'
import { enrollmentService, studentService, courseService } from '@/database'

interface EnrollmentWithDetails extends Enrollment {
  student_name?: string
  course_title?: string
}

interface EnrollmentManagerProps {
  studentId?: string
  courseId?: string
}

export default function EnrollmentManager({ studentId, courseId }: EnrollmentManagerProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || '')
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verwende die importierten Service-Instanzen direkt

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentEnrollments()
    } else if (selectedCourseId) {
      loadCourseEnrollments()
    }
  }, [selectedStudentId, selectedCourseId])

  const loadInitialData = async () => {
    try {
      const [studentsData, coursesData] = await Promise.all([
        studentService.getAllStudents(),
        courseService.getAllCourses()
      ])
      setStudents(studentsData)
      setCourses(coursesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Daten'
      setError(errorMessage)
    }
  }

  const loadStudentEnrollments = async () => {
    if (!selectedStudentId) return

    try {
      setLoading(true)
      setError(null)
      
      const enrollmentsData = await enrollmentService.getStudentEnrollments(selectedStudentId)
      
      const enrichedEnrollments = enrollmentsData.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.course_id)
        return {
          ...enrollment,
          course_title: course?.title || 'Unbekannter Kurs'
        }
      })

      setEnrollments(enrichedEnrollments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Einschreibungen'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadCourseEnrollments = async () => {
    if (!selectedCourseId) return

    try {
      setLoading(true)
      setError(null)
      
      const enrollmentsData = await enrollmentService.getCourseEnrollments(selectedCourseId)
      
      const enrichedEnrollments = enrollmentsData.map(enrollment => {
        const student = students.find(s => s.id === enrollment.student_id)
        return {
          ...enrollment,
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Unbekannter Student'
        }
      })

      setEnrollments(enrichedEnrollments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Einschreibungen'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!selectedStudentId || !selectedCourseId) {
      setError('Bitte wählen Sie sowohl einen Studenten als auch einen Kurs aus')
      return
    }

    try {
      setError(null)
      await enrollmentService.enrollStudent(selectedStudentId, selectedCourseId)
      
      // Refresh enrollments
      if (selectedStudentId) {
        await loadStudentEnrollments()
      } else if (selectedCourseId) {
        await loadCourseEnrollments()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Einschreiben des Studenten'
      setError(errorMessage)
    }
  }

  const handleUnenroll = async (enrollment: Enrollment) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Studenten abmelden möchten?')) return

    try {
      setError(null)
      await enrollmentService.unenrollStudent(enrollment.student_id, enrollment.course_id)
      setEnrollments(enrollments.filter(e => e.id !== enrollment.id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Abmelden des Studenten'
      setError(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      {/* Enrollment Form */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Einschreibungen verwalten</h3>
            <p className="text-sm text-gray-500 mt-1">Studenten in Kurse einschreiben oder abmelden</p>
          </div>
        </div>
        
        <div className="card-content">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200/60 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="student" className="block text-sm font-medium text-gray-700">
                Student auswählen
              </label>
              <select
                id="student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="input"
              >
                <option value="">Studenten auswählen</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} ({student.student_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Kurs auswählen
              </label>
              <select
                id="course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="input"
              >
                <option value="">Kurs auswählen</option>
                {courses.map(course => {
                  const isExpired = new Date(course.end_date) < new Date()
                  return (
                    <option 
                      key={course.id} 
                      value={course.id}
                      disabled={isExpired}
                      className={isExpired ? 'text-gray-400' : ''}
                    >
                      {course.title}{isExpired ? ' (Abgelaufen)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleEnroll}
                disabled={!selectedStudentId || !selectedCourseId}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Einschreiben
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStudentId ? 'Studenten-Einschreibungen' : selectedCourseId ? 'Kurs-Einschreibungen' : 'Alle Einschreibungen'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? 'Wird geladen...' : `${enrollments.length} Einschreibungen gefunden`}
              </p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Einschreibungen werden geladen...</span>
            </div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="card-content">
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Keine Einschreibungen gefunden</h4>
              <p className="text-sm text-gray-500">Schreiben Sie Studenten in Kurse ein, um zu beginnen.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {!selectedStudentId && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student
                      </th>
                    )}
                    {!selectedCourseId && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Kurs
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Einschreibungsdatum
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                      {!selectedStudentId && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-700">
                                {enrollment.student_name?.split(' ').map(n => n[0]).join('') || '?'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student_name}
                            </div>
                          </div>
                        </td>
                      )}
                      {!selectedCourseId && (
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.course_title}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {formatDate(enrollment.enrollment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleUnenroll(enrollment)}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          >
                            Abmelden
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
      </div>
    </div>
  )
}