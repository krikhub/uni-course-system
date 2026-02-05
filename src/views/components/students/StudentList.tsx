'use client'

import { useState, useEffect } from 'react'
import { Student } from '@/models/Student'
import { StudentController } from '@/controllers/StudentController'

interface StudentListProps {
  onStudentSelect?: (student: Student) => void
  onStudentEdit?: (student: Student) => void
  onStudentDelete?: (studentId: string) => void
}

export default function StudentList({ onStudentSelect, onStudentEdit, onStudentDelete }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const studentController = new StudentController()

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentController.getAllStudents()
      setStudents(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Studenten'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Studenten löschen möchten?')) return

    try {
      await studentController.deleteStudent(studentId)
      setStudents(students.filter(s => s.id !== studentId))
      onStudentDelete?.(studentId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen des Studenten'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3 text-[#565D56]">
            <div className="w-5 h-5 border-2 border-[#C5CDC7] border-t-[#565D56] rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Studenten werden geladen...</span>
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
                onClick={loadStudents}
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
            <h3 className="text-lg font-semibold text-[#383B39]">Studenten</h3>
            <p className="text-sm text-[#565D56] mt-1">{students.length} Studenten gefunden</p>
          </div>
        </div>
      </div>
      
      {students.length === 0 ? (
        <div className="card-content">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-[#C5CDC7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h4 className="text-sm font-medium text-[#383B39] mb-1">Keine Studenten gefunden</h4>
            <p className="text-sm text-[#565D56]">Fügen Sie den ersten Studenten hinzu, um zu beginnen.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#C5CDC7]/40">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Matrikelnummer
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#565D56] uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5CDC7]/30">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F0F4F1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#565D56]/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#565D56]">
                            {student.first_name[0]}{student.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#383B39]">
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#565D56]">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-[#565D56]">{student.student_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {onStudentSelect && (
                          <button
                            onClick={() => onStudentSelect(student)}
                            className="px-3 py-1.5 text-xs font-medium text-[#565D56] bg-[#565D56]/10 hover:bg-[#565D56]/20 rounded-md transition-colors"
                          >
                            Auswählen
                          </button>
                        )}
                        {onStudentEdit && (
                          <button
                            onClick={() => onStudentEdit(student)}
                            className="px-3 py-1.5 text-xs font-medium text-[#565D56] bg-[#C5CDC7]/30 hover:bg-[#C5CDC7]/50 rounded-md transition-colors"
                          >
                            Bearbeiten
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(student.id)}
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
    </div>
  )
}