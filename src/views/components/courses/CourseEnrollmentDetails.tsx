'use client'

import { useState, useEffect } from 'react'
import { enrollmentService, studentService } from '@/database'

interface EnrolledStudent {
  id: string
  name: string
  email: string
  student_number: string
  enrollment_date: string
}

interface CourseEnrollmentDetailsProps {
  courseId: string
  courseTitle: string
  maxParticipants: number
}

export default function CourseEnrollmentDetails({ 
  courseId, 
  courseTitle, 
  maxParticipants 
}: CourseEnrollmentDetailsProps) {
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEnrolledStudents()
  }, [courseId])

  const loadEnrolledStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [enrollments, allStudents] = await Promise.all([
        enrollmentService.getCourseEnrollments(courseId),
        studentService.getAllStudents()
      ])

      const enrichedStudents = enrollments.map(enrollment => {
        const student = allStudents.find(s => s.id === enrollment.student_id)
        return {
          id: enrollment.student_id,
          name: student ? `${student.first_name} ${student.last_name}` : 'Unbekannter Student',
          email: student?.email || 'Unbekannt',
          student_number: student?.student_number || 'Unbekannt',
          enrollment_date: enrollment.enrollment_date
        }
      })

      setEnrolledStudents(enrichedStudents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Einschreibungen'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-[#F0F4F1]/50 rounded-lg border border-[#C5CDC7]/40">
        <div className="flex items-center gap-2 text-sm text-[#565D56]">
          <div className="w-4 h-4 border-2 border-[#C5CDC7] border-t-[#565D56] rounded-full animate-spin"></div>
          Eingeschriebene Studenten werden geladen...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-[#383B39]/5 rounded-lg border border-[#9DA69F]/60">
        <div className="text-sm text-[#383B39]">
          Fehler beim Laden der Einschreibungen: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-white rounded-lg border border-[#C5CDC7]/60 shadow-sm">
      <div className="px-4 py-3 border-b border-[#C5CDC7]/40">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#383B39]">
            Eingeschriebene Studenten in "{courseTitle}"
          </h4>
          <span className="text-xs text-[#565D56] bg-[#565D56]/10 px-2 py-1 rounded-full">
            {enrolledStudents.length} / {maxParticipants}
          </span>
        </div>
      </div>
      
      {enrolledStudents.length === 0 ? (
        <div className="p-6 text-center">
          <svg className="w-8 h-8 text-[#C5CDC7] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm text-[#565D56]">Noch keine Studenten eingeschrieben</p>
        </div>
      ) : (
        <div className="divide-y divide-[#C5CDC7]/30">
          {enrolledStudents.map((student, index) => (
            <div key={student.id} className="px-4 py-3 hover:bg-[#F0F4F1]/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#565D56]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-[#565D56]">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#383B39] truncate">
                      {student.name}
                    </div>
                    <div className="text-xs text-[#565D56] truncate">
                      {student.email}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono text-[#565D56]">
                    {student.student_number}
                  </div>
                  <div className="text-xs text-[#9DA69F]">
                    {formatDate(student.enrollment_date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}