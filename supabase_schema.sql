-- Emmanuel Secondary School Supabase Schema

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    previous_class TEXT,
    gender TEXT,
    status TEXT,
    fees TEXT,
    email TEXT,
    parent_number TEXT,
    address TEXT,
    password TEXT,
    enrollment_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Score Records Table
CREATE TABLE IF NOT EXISTS public.scores (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    session TEXT NOT NULL,
    ca1 INTEGER DEFAULT 0,
    ca2 INTEGER DEFAULT 0,
    ca3 INTEGER DEFAULT 0,
    ca4 INTEGER DEFAULT 0,
    exam INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    grade TEXT,
    remark TEXT,
    position TEXT,
    annual_score INTEGER,
    teacher_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Affective Records Table
CREATE TABLE IF NOT EXISTS public.affective_records (
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session TEXT NOT NULL,
    attentiveness INTEGER DEFAULT 0,
    attendance INTEGER DEFAULT 0,
    punctuality INTEGER DEFAULT 0,
    neatness INTEGER DEFAULT 0,
    politeness INTEGER DEFAULT 0,
    rel_with_others INTEGER DEFAULT 0,
    curiosity INTEGER DEFAULT 0,
    honesty INTEGER DEFAULT 0,
    humility INTEGER DEFAULT 0,
    tolerance INTEGER DEFAULT 0,
    leadership INTEGER DEFAULT 0,
    courage INTEGER DEFAULT 0,
    handwriting INTEGER DEFAULT 0,
    fluency INTEGER DEFAULT 0,
    games_sports INTEGER DEFAULT 0,
    music_skills INTEGER DEFAULT 0,
    construction INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (student_id, session)
);

-- PIN Records Table
CREATE TABLE IF NOT EXISTS public.pin_records (
    id TEXT PRIMARY KEY,
    pin_code TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    session TEXT NOT NULL,
    status TEXT NOT NULL,
    uses_remaining INTEGER NOT NULL,
    max_uses INTEGER NOT NULL,
    date_generated DATE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PIN Audit Logs Table
CREATE TABLE IF NOT EXISTS public.pin_audit_logs (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class TEXT NOT NULL,
    session TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    status TEXT NOT NULL
);

-- Sessions Table (to reflect created academic sessions in DB)
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    session_string TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

