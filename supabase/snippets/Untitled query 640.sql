INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Web Development mit React',
    'Moderne Frontend-Entwicklung mit React, TypeScript und Next.js',
    l.id,
    20,
    '2026-02-01',
    '2026-05-15'
FROM lecturers l WHERE l.email = 'emily.davis@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Machine Learning Grundlagen',
    'Einführung in maschinelles Lernen mit Python und scikit-learn',
    l.id,
    15,
    '2026-03-01',
    '2026-06-15'
FROM lecturers l WHERE l.email = 'john.smith@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Statistik für Informatiker',
    'Angewandte Statistik und Wahrscheinlichkeitsrechnung',
    l.id,
    25,
    '2026-02-15',
    '2026-06-01'
FROM lecturers l WHERE l.email = 'sarah.johnson@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Quantenphysik',
    'Einführung in die Quantenmechanik und ihre Anwendungen',
    l.id,
    12,
    '2026-04-01',
    '2026-07-15'
FROM lecturers l WHERE l.email = 'michael.brown@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Softwarearchitektur',
    'Design Patterns, SOLID Prinzipien und Clean Architecture',
    l.id,
    18,
    '2026-03-15',
    '2026-07-01'
FROM lecturers l WHERE l.email = 'david.wilson@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Molekularbiologie',
    'DNA, RNA, Proteine und Genexpression',
    l.id,
    22,
    '2026-02-01',
    '2026-05-15'
FROM lecturers l WHERE l.email = 'lisa.taylor@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Advanced JavaScript',
    'ES6+, Async/Await, Module Systems und Performance Optimierung',
    l.id,
    16,
    '2026-08-01',
    '2026-11-15'
FROM lecturers l WHERE l.email = 'emily.davis@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Lineare Algebra II',
    'Eigenwerte, Eigenvektoren und Anwendungen',
    l.id,
    20,
    '2026-08-15',
    '2026-12-01'
FROM lecturers l WHERE l.email = 'sarah.johnson@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, lecturer_id, max_participants, start_date, end_date)
SELECT 
    'Thermodynamik',
    'Wärmelehre und statistische Mechanik',
    l.id,
    18,
    '2026-09-01',
    '2026-12-15'
FROM lecturers l WHERE l.email = 'michael.brown@university.edu'
ON CONFLICT DO NOTHING;

SELECT 
    title,
    start_date,
    end_date,
    CASE 
        WHEN start_date > CURRENT_DATE THEN 'Zukünftig'
        WHEN end_date < CURRENT_DATE THEN 'Vergangen'
        ELSE 'Aktuell'
    END as status
FROM courses 
ORDER BY start_date;

SELECT 
    CASE 
        WHEN start_date > CURRENT_DATE THEN 'Zukünftige Kurse'
        WHEN end_date < CURRENT_DATE THEN 'Vergangene Kurse'
        ELSE 'Aktuelle Kurse'
    END as kurs_status,
    COUNT(*) as anzahl
FROM courses 
GROUP BY 
    CASE 
        WHEN start_date > CURRENT_DATE THEN 'Zukünftige Kurse'
        WHEN end_date < CURRENT_DATE THEN 'Vergangene Kurse'
        ELSE 'Aktuelle Kurse'
    END
ORDER BY kurs_status;

SELECT 'Kurse erfolgreich auf 2026 aktualisiert!' as status;