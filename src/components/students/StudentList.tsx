'use client'

import { useState, useEffect } from 'react'
import { Student } from '@/types/database'
import { studentService } from '@/services'

interface StudentListProps {
  onStudentSelect?: (student: Student) => void
  onStudentEdit?: (student: Student) => void
  onStudentDelete?: (studentId: string) => void
}

export default function StudentList({ onStudentSelect, onStudentEdit, onStudentDelete }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verwende die importierte Service-Instanz direkt

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentService.getAllStudents()
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
      await studentService.deleteStudent(studentId)
      setStudents(students.filter(s => s.id !== studentId))
      onStudentDelete?.(studentId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen des Studenten'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Studenten werden geladen...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Fehler</div>
        <div className="text-red-600">{error}</div>
        <button 
          onClick={loadStudents}
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
        <h3 className="text-lg font-medium text-gray-900">Studenten</h3>
      </div>
      
      {students.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Keine Studenten gefunden
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrikelnummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.student_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onStudentSelect && (
                      <button
                        onClick={() => onStudentSelect(student)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Auswählen
                      </button>
                    )}
                    {onStudentEdit && (
                      <button
                        onClick={() => onStudentEdit(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Bearbeiten
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(student.id)}
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