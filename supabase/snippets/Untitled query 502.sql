CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS lecturers CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_course_capacity() CASCADE;

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lecturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    lecturer_id UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_lecturers_email ON lecturers(email);
CREATE INDEX idx_lecturers_department ON lecturers(department);
CREATE INDEX idx_lecturers_created_at ON lecturers(created_at);
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_courses_title ON courses(title);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_enrollment_date ON enrollments(enrollment_date);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecturers_updated_at 
    BEFORE UPDATE ON lecturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION check_course_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_enrollments INTEGER;
    max_capacity INTEGER;
BEGIN
    SELECT COUNT(*), c.max_participants
    INTO current_enrollments, max_capacity
    FROM enrollments e
    JOIN courses c ON c.id = NEW.course_id
    WHERE e.course_id = NEW.course_id
    GROUP BY c.max_participants;

    IF current_enrollments IS NULL THEN
        SELECT max_participants INTO max_capacity
        FROM courses WHERE id = NEW.course_id;
        current_enrollments := 0;
    END IF;

    IF current_enrollments >= max_capacity THEN
        RAISE EXCEPTION 'Course is full. Maximum participants: %, Current enrollments: %', 
            max_capacity, current_enrollments;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_course_capacity
    BEFORE INSERT ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION check_course_capacity();

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

INSERT INTO lecturers (first_name, last_name, email, department) VALUES
    ('John', 'Smith', 'john.smith@university.edu', 'Computer Science'),
    ('Sarah', 'Johnson', 'sarah.johnson@university.edu', 'Mathematics'),
    ('Michael', 'Brown', 'michael.brown@university.edu', 'Physics'),
    ('Emily', 'Davis', 'emily.davis@university.edu', 'Computer Science'),
    ('David', 'Wilson', 'david.wilson@university.edu', 'Engineering'),
    ('Lisa', 'Taylor', 'lisa.taylor@university.edu', 'Biology');

INSERT INTO students (first_name, last_name, email, student_number) VALUES
    ('Alice', 'Wilson', 'alice.wilson@student.edu', 'S001'),
    ('Bob', 'Miller', 'bob.miller@student.edu', 'S002'),
    ('Charlie', 'Garcia', 'charlie.garcia@student.edu', 'S003'),
    ('Diana', 'Martinez', 'diana.martinez@student.edu', 'S004'),
    ('Eve', 'Anderson', 'eve.anderson@student.edu', 'S005'),
    ('Frank', 'Thomas', 'frank.thomas@student.edu', 'S006'),
    ('Grace', 'Jackson', 'grace.jackson@student.edu', 'S007'),
    ('Henry', 'White', 'henry.white@student.edu', 'S008'),
    ('Ivy', 'Harris', 'ivy.harris@student.edu', 'S009'),
    ('Jack', 'Martin', 'jack.martin@student.edu', 'S010');

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Introduction to Programming',
    'Learn the basics of programming with Python. This course covers variables, functions, loops, and basic data structures.',
    l.id,
    25,
    '2024-02-01'::date,
  '2024-05-15'::date
FROM lecturers l WHERE l.email = 'john.smith@university.edu'
UNION ALL
SELECT 
    'Advanced Mathematics',
    'Calculus and Linear Algebra for Computer Science students. Prerequisites: Basic Mathematics.',
    l.id,
    20,
    '2024-02-01',
    '2024-05-15'
FROM lecturers l WHERE l.email = 'sarah.johnson@university.edu'
UNION ALL
SELECT 
    'Physics Fundamentals',
    'Introduction to Classical Mechanics, Thermodynamics, and Electromagnetism.',
    l.id,
    30,
    '2024-02-15',
    '2024-06-01'
FROM lecturers l WHERE l.email = 'michael.brown@university.edu'
UNION ALL
SELECT 
    'Data Structures and Algorithms',
    'Advanced programming concepts including trees, graphs, sorting, and searching algorithms.',
    l.id,
    15,
    '2024-03-01',
    '2024-06-15'
FROM lecturers l WHERE l.email = 'emily.davis@university.edu'
UNION ALL
SELECT 
    'Database Systems',
    'Introduction to relational databases, SQL, and database design principles.',
    l.id,
    20,
    '2024-02-15',
    '2024-05-30'
FROM lecturers l WHERE l.email = 'john.smith@university.edu'
UNION ALL
SELECT 
    'Biology Basics',
    'Introduction to cell biology, genetics, and evolution.',
    l.id,
    35,
    '2024-02-01',
    '2024-05-15'
FROM lecturers l WHERE l.email = 'lisa.taylor@university.edu';

INSERT INTO enrollments (student_id, course_id, enrollment_date)
SELECT 
    s.id,
    c.id,
    NOW() - INTERVAL '5 days'
FROM students s, courses c 
WHERE s.email = 'alice.wilson@student.edu' 
AND c.title = 'Introduction to Programming'
UNION ALL
SELECT 
    s.id,
    c.id,
    NOW() - INTERVAL '3 days'
FROM students s, courses c 
WHERE s.email = 'bob.miller@student.edu' 
AND c.title = 'Introduction to Programming'
UNION ALL
SELECT 
    s.id,
    c.id,
    NOW() - INTERVAL '2 days'
FROM students s, courses c 
WHERE s.email = 'alice.wilson@student.edu' 
AND c.title = 'Advanced Mathematics'
UNION ALL
SELECT 
    s.id,
    c.id,
    NOW() - INTERVAL '1 day'
FROM students s, courses c 
WHERE s.email = 'charlie.garcia@student.edu' 
AND c.title = 'Physics Fundamentals';

SELECT 'Tables created successfully!' as status;

SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'lecturers' as table_name, COUNT(*) as record_count FROM lecturers
UNION ALL
SELECT 'courses' as table_name, COUNT(*) as record_count FROM courses
UNION ALL
SELECT 'enrollments' as table_name, COUNT(*) as record_count FROM enrollments;

SELECT 
    s.first_name || ' ' || s.last_name as student_name,
    c.title as course_title,
    l.first_name || ' ' || l.last_name as lecturer_name,
    e.enrollment_date
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
JOIN lecturers l ON c.lecturer_id = l.id
ORDER BY e.enrollment_date DESC;

SELECT 'Schema creation completed successfully! You can now use the application.' as final_status;
