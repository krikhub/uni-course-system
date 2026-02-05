'use client'

import { useState, useEffect } from 'react'
import { Student } from '@/models/Student'
import { StudentController } from '@/controllers/StudentController'

interface StudentFormProps {
  student?: Student | null
  onSubmit: (student: Student) => void
  onCancel: () => void
}

export default function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const studentController = new StudentController()
  const isEditing = !!student

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        student_number: student.student_number
      })
    }
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result: Student
      
      if (isEditing) {
        result = await studentController.updateStudent(student.id, formData)
      } else {
        result = await studentController.createStudent(formData)
      }
      
      onSubmit(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern des Studenten'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Student bearbeiten' : 'Neuen Studenten hinzufügen'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? 'Bearbeiten Sie die Studentendaten' : 'Fügen Sie einen neuen Studenten hinzu'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Max"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-Mail-Adresse *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="max.mustermann@university.de"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="student_number" className="block text-sm font-medium text-gray-700">
            Matrikelnummer *
          </label>
          <input
            type="text"
            id="student_number"
            name="student_number"
            value={formData.student_number}
            onChange={handleChange}
            required
            className="input font-mono"
            placeholder="123456789"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Speichern...
              </div>
            ) : (
              isEditing ? 'Aktualisieren' : 'Erstellen'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}