'use client'

import { useState } from 'react'
import { Student, Course } from '@/types/database'
import StudentList from './students/StudentList'
import StudentForm from './students/StudentForm'
import CourseList from './courses/CourseList'
import EnrollmentManager from './enrollments/EnrollmentManager'
import ConnectionTest from './ConnectionTest'

type ActiveView = 'students' | 'courses' | 'enrollments'
type ActiveModal = 'student-form' | null

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('students')
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setActiveView('enrollments')
  }

  const handleStudentEdit = (student: Student) => {
    setEditingStudent(student)
    setActiveModal('student-form')
  }

  const handleStudentFormSubmit = (student: Student) => {
    setActiveModal(null)
    setEditingStudent(null)
    // Refresh will happen automatically via component re-render
  }

  const handleStudentFormCancel = () => {
    setActiveModal(null)
    setEditingStudent(null)
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setActiveView('enrollments')
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'students':
        return (
          <StudentList
            onStudentSelect={handleStudentSelect}
            onStudentEdit={handleStudentEdit}
          />
        )
      
      case 'courses':
        return (
          <CourseList
            onCourseSelect={handleCourseSelect}
            showEnrollmentActions={!!selectedStudent}
            selectedStudentId={selectedStudent?.id}
          />
        )
      
      case 'enrollments':
        return (
          <EnrollmentManager
            studentId={selectedStudent?.id}
            courseId={selectedCourse?.id}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Universitäts-Kursverwaltungssystem
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveView('students')
                setSelectedStudent(null)
                setSelectedCourse(null)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Studenten
            </button>
            <button
              onClick={() => {
                setActiveView('courses')
                setSelectedStudent(null)
                setSelectedCourse(null)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kurse
            </button>
            <button
              onClick={() => {
                setActiveView('enrollments')
                setSelectedStudent(null)
                setSelectedCourse(null)
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Einschreibungen
            </button>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-sm text-blue-800">
                  Ausgewählter Student: {selectedStudent.first_name} {selectedStudent.last_name}
                </span>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
            {selectedCourse && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-sm text-green-800">
                  Ausgewählter Kurs: {selectedCourse.title}
                </span>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {activeView === 'students' && (
              <button
                onClick={() => setActiveModal('student-form')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Student hinzufügen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-6">
          <ConnectionTest />
        </div>
        {renderActiveView()}
      </main>

      {/* Modals */}
      {activeModal === 'student-form' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <StudentForm
              student={editingStudent}
              onSubmit={handleStudentFormSubmit}
              onCancel={handleStudentFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  )
}