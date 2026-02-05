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
    <div className="space-y-6">
      {/* Enrollment Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Einschreibungen verwalten</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              id="student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Studenten auswählen</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.student_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Kurs
            </label>
            <select
              id="course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kurs auswählen</option>
              {courses.map(course => {
                const isExpired = new Date(course.end_date) < new Date()
                return (
                  <option 
                    key={course.id} 
                    value={course.id}
                    disabled={isExpired}
                    style={isExpired ? { color: '#9CA3AF' } : {}}
                  >
                    {course.title}{isExpired ? ' (Abgelaufen)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <button
              onClick={handleEnroll}
              disabled={!selectedStudentId || !selectedCourseId}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Student einschreiben
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedStudentId ? 'Studenten-Einschreibungen' : selectedCourseId ? 'Kurs-Einschreibungen' : 'Alle Einschreibungen'}
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Einschreibungen werden geladen...</div>
        ) : enrollments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Keine Einschreibungen gefunden</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!selectedStudentId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                  )}
                  {!selectedCourseId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kurs
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Einschreibungsdatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    {!selectedStudentId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.student_name}
                        </div>
                      </td>
                    )}
                    {!selectedCourseId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.course_title}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(enrollment.enrollment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUnenroll(enrollment)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Abmelden
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}