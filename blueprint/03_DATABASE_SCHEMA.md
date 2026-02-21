# blueprint/03_DATABASE_SCHEMA.md

## DB (Local)
Preferred: SQLite
Alternative: MySQL local

## Tables

### users
- id (PK)
- role ENUM('admin','student') NOT NULL
- name VARCHAR(150) NOT NULL
- phone VARCHAR(30) NULL (required for students)
- email VARCHAR(150) NULL (optional for admin)
- student_code VARCHAR(30) UNIQUE NULL (students only)
- password HASH NOT NULL
- is_active BOOLEAN DEFAULT true
- timestamps
- deleted_at (soft delete)

### courses
- id (PK)
- title VARCHAR(200) NOT NULL
- description TEXT NULL
- is_active BOOLEAN DEFAULT true
- timestamps
- deleted_at

### lessons
- id (PK)
- course_id (FK) NOT NULL
- title VARCHAR(200) NOT NULL
- description TEXT NULL
- youtube_url TEXT NOT NULL
- order INT NOT NULL DEFAULT 1
- timestamps
- deleted_at
Indexes:
- (course_id, order)

### enrollments
- id (PK)
- user_id (FK users.id) NOT NULL (student)
- course_id (FK courses.id) NOT NULL
- timestamps
Constraints:
- UNIQUE(user_id, course_id)

### lesson_progress
- id (PK)
- user_id (FK users.id) NOT NULL (student)
- lesson_id (FK lessons.id) NOT NULL
- is_completed BOOLEAN DEFAULT false
- completed_at DATETIME NULL
- timestamps
Constraints:
- UNIQUE(user_id, lesson_id)

## Relationships
- Course hasMany Lessons
- Student belongsToMany Courses via enrollments
- Student hasMany Progress rows
