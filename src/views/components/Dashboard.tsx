'use client'

import { useState } from 'react'
import { Student } from '@/models/Student'
import { Course } from '@/models/Course'
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

  const handleStudentFormSubmit = () => {
    setActiveModal(null)
    setEditingStudent(null)
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
    <div className="min-h-screen bg-[#F0F4F1]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#C5CDC7]/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#383B39] tracking-tight">
                Kursverwaltung
              </h1>
              <p className="text-sm text-[#565D56] mt-1">
                Studenten, Kurse und Einschreibungen verwalten
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-[#C5CDC7]/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setActiveView('students')
                setSelectedStudent(null)
                setSelectedCourse(null)
              }}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeView === 'students'
                  ? 'bg-[#565D56]/10 text-[#383B39] border-b-2 border-[#565D56]'
                  : 'text-[#565D56] hover:text-[#383B39] hover:bg-[#C5CDC7]/20'
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
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeView === 'courses'
                  ? 'bg-[#565D56]/10 text-[#383B39] border-b-2 border-[#565D56]'
                  : 'text-[#565D56] hover:text-[#383B39] hover:bg-[#C5CDC7]/20'
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
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeView === 'enrollments'
                  ? 'bg-[#565D56]/10 text-[#383B39] border-b-2 border-[#565D56]'
                  : 'text-[#565D56] hover:text-[#383B39] hover:bg-[#C5CDC7]/20'
              }`}
            >
              Einschreibungen
            </button>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {selectedStudent && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#565D56]/10 text-[#383B39] rounded-lg border border-[#9DA69F]/60">
                <div className="w-2 h-2 bg-[#565D56] rounded-full"></div>
                <span className="text-sm font-medium">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </span>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="ml-1 text-[#565D56] hover:text-[#383B39] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {selectedCourse && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#9DA69F]/20 text-[#383B39] rounded-lg border border-[#9DA69F]/60">
                <div className="w-2 h-2 bg-[#9DA69F] rounded-full"></div>
                <span className="text-sm font-medium">
                  {selectedCourse.title}
                </span>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="ml-1 text-[#565D56] hover:text-[#383B39] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeView === 'students' && (
              <button
                onClick={() => setActiveModal('student-form')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#565D56] hover:bg-[#383B39] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#565D56]/20 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Student hinzufügen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <ConnectionTest />
        </div>
        {renderActiveView()}
      </main>

      {/* Modals */}
      {activeModal === 'student-form' && (
        <div className="fixed inset-0 bg-[#383B39]/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-[#C5CDC7]/60">
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