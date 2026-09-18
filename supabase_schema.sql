-- =========================================================================
-- Emmanuel Secondary School, Makurdi - Unified Database Schema
-- Complete Supabase / PostgreSQL Schema for All 18 School Collections
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    previous_class TEXT,
    gender TEXT DEFAULT 'Not Specified',
    status TEXT DEFAULT 'Active',
    fees TEXT DEFAULT 'Unpaid',
    email TEXT,
    parent_number TEXT,
    address TEXT,
    password TEXT DEFAULT 'password123',
    enrollment_status TEXT DEFAULT 'Enrolled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TEACHERS & STAFF TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subjects JSONB DEFAULT '[]'::jsonb,
    classes JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    qualification TEXT,
    join_date TEXT,
    avatar TEXT,
    is_admin BOOLEAN DEFAULT false,
    system_roles JSONB DEFAULT '["Teacher"]'::jsonb,
    employment_type TEXT DEFAULT 'Full-Time',
    department TEXT DEFAULT 'Academic',
    emergency_contact TEXT,
    date_of_birth TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CONTINUOUS ASSESSMENT & SCORES TABLE
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

-- 4. AFFECTIVE & BEHAVIORAL DOMAIN TABLE
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

-- 5. SCRATCH CARD PIN RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.pin_records (
    id TEXT PRIMARY KEY,
    pin_code TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    session TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    uses_remaining INTEGER NOT NULL DEFAULT 5,
    max_uses INTEGER NOT NULL DEFAULT 5,
    date_generated DATE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PIN AUDIT LOGS TABLE
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

-- 7. ACADEMIC SESSIONS & CALENDAR TABLE
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    session_string TEXT PRIMARY KEY,
    is_current BOOLEAN DEFAULT false,
    term TEXT DEFAULT 'First Term',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ADMISSION APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.admission_applications (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    name TEXT NOT NULL,
    gender TEXT,
    class TEXT NOT NULL,
    assigned_class TEXT,
    date DATE,
    status TEXT DEFAULT 'Under Review',
    payment TEXT DEFAULT 'Paid',
    acceptance_fee TEXT DEFAULT 'Unpaid',
    phone TEXT,
    email TEXT,
    state TEXT,
    lga TEXT,
    exam_score INTEGER,
    exam_status TEXT,
    offer_status TEXT,
    documents JSONB DEFAULT '{}'::jsonb,
    password TEXT,
    exam_slip_downloaded BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ENTRANCE EXAMINATION SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.entrance_exam_schedules (
    id TEXT PRIMARY KEY,
    batch_name TEXT NOT NULL,
    class_target TEXT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    venue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    total_candidates INTEGER DEFAULT 0,
    seated_candidates INTEGER DEFAULT 0,
    completed_candidates INTEGER DEFAULT 0,
    subjects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CBT QUESTION BANK TABLE
CREATE TABLE IF NOT EXISTS public.cbt_questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer INTEGER NOT NULL DEFAULT 0,
    subject TEXT NOT NULL,
    class TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    explanation TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. FINANCE TRANSACTIONS & RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    student_id TEXT,
    student_name TEXT NOT NULL,
    class TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'Bank Transfer',
    reference TEXT,
    status TEXT DEFAULT 'Verified',
    term TEXT,
    recorded_by TEXT,
    receipt_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TUITION FEE STRUCTURES TABLE
CREATE TABLE IF NOT EXISTS public.fee_breakdowns (
    class_name TEXT PRIMARY KEY,
    tuition NUMERIC(10, 2) DEFAULT 0,
    ict NUMERIC(10, 2) DEFAULT 0,
    library NUMERIC(10, 2) DEFAULT 0,
    pta NUMERIC(10, 2) DEFAULT 0,
    sports NUMERIC(10, 2) DEFAULT 0,
    medical NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. GATE ATTENDANCE SCANNER LOGS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL,
    person_name TEXT NOT NULL,
    person_type TEXT NOT NULL, -- 'Student' or 'Staff'
    class_name TEXT,
    date DATE NOT NULL,
    time_in TEXT NOT NULL,
    time_out TEXT,
    status TEXT NOT NULL DEFAULT 'Present',
    scan_method TEXT DEFAULT 'QR_SCAN',
    scanned_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. STUDENT DIGITAL ID CARDS TABLE
CREATE TABLE IF NOT EXISTS public.student_id_cards (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    class TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    card_status TEXT DEFAULT 'Active',
    qr_token TEXT NOT NULL UNIQUE,
    blood_group TEXT DEFAULT 'O+',
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. PORTAL SETTINGS & BRANDING TABLE
CREATE TABLE IF NOT EXISTS public.portal_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_school_settings',
    school_name TEXT NOT NULL,
    motto TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    website TEXT,
    logo_url TEXT,
    principal_name TEXT,
    principal_signature_url TEXT,
    portal_notice TEXT,
    theme_preset TEXT DEFAULT 'navy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. NEWS & CIRCULARS TABLE
CREATE TABLE IF NOT EXISTS public.news_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT DEFAULT 'General',
    published BOOLEAN DEFAULT true,
    author TEXT DEFAULT 'Principal Office',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. CAMPUS PHOTO GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    date DATE NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. SYSTEM COMPLIANCE & AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_affected TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    severity TEXT DEFAULT 'Medium',
    ip_address TEXT,
    device TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_scores_student_session ON public.scores(student_id, session);
CREATE INDEX IF NOT EXISTS idx_pins_code ON public.pin_records(pin_code);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_attendance_person ON public.attendance_logs(person_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to school settings and announcements
CREATE POLICY IF NOT EXISTS "Public Read Portal Settings" ON public.portal_settings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public Read News" ON public.news_announcements FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public Read Gallery" ON public.gallery_items FOR SELECT USING (true);
