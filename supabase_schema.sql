-- ==========================================================
-- THE DATA DOT - ENTERPRISE SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (1-Click Setup)
-- ==========================================================

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  plan TEXT DEFAULT 'Enterprise 15-Min 24/7 SLA',
  contract_status TEXT DEFAULT 'Active Retainer',
  account_manager TEXT DEFAULT 'S. Murugan',
  devices_recovered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'admin')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  bench_assignment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  device_or_subject TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('HDD', 'SSD', 'RAID', 'FLASH', 'NETWORK', 'SERVER', 'GENERAL')),
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'Intake & Diagnostics',
  cloned_percent NUMERIC(5,2) DEFAULT 0,
  urgency TEXT CHECK (urgency IN ('Critical', 'High', 'Standard')),
  symptoms TEXT,
  tech_notes TEXT,
  assigned_bench TEXT,
  assigned_tech TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TICKET MESSAGES (LIVE TWO-WAY CLIENT/TECH CHAT)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('Customer', 'Technician', 'Admin')),
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BLOG POSTS CMS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  read_time TEXT DEFAULT '5 min read',
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
  cover_image TEXT,
  excerpt TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FAQS CMS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on blog posts" ON public.blog_posts;
CREATE POLICY "Allow read on blog posts" ON public.blog_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read on faqs" ON public.faqs;
CREATE POLICY "Allow read on faqs" ON public.faqs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read on tickets" ON public.tickets;
CREATE POLICY "Allow read on tickets" ON public.tickets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read on ticket messages" ON public.ticket_messages;
CREATE POLICY "Allow read on ticket messages" ON public.ticket_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read on companies" ON public.companies;
CREATE POLICY "Allow read on companies" ON public.companies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert and update on tickets" ON public.tickets;
CREATE POLICY "Allow insert and update on tickets" ON public.tickets
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert on ticket messages" ON public.ticket_messages;
CREATE POLICY "Allow insert on ticket messages" ON public.ticket_messages
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert and update on companies" ON public.companies;
CREATE POLICY "Allow insert and update on companies" ON public.companies
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert and update on blog posts" ON public.blog_posts;
CREATE POLICY "Allow insert and update on blog posts" ON public.blog_posts
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert and update on faqs" ON public.faqs;
CREATE POLICY "Allow insert and update on faqs" ON public.faqs
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow insert and select on audit logs" ON public.audit_logs;
CREATE POLICY "Allow insert and select on audit logs" ON public.audit_logs
  FOR ALL USING (true);

-- ==========================================================
-- SEED INITIAL MOCK DATA
-- ==========================================================

-- Seed Initial Companies
INSERT INTO public.companies (name, industry, plan, account_manager, devices_recovered, contract_status)
VALUES 
  ('Apex Healthcare Diagnostic Center', 'Healthcare & Diagnostics', 'Enterprise 15-Min 24/7 SLA', 'S. Murugan', 14, 'Active Retainer'),
  ('Nexus Legal Advisors LLP', 'Corporate & Patent Law', 'Priority 4-Hour Response', 'K. Vignesh', 6, 'Active Retainer'),
  ('Metropolitan Logistics Warehousing', 'Supply Chain & Storage', 'Enterprise 15-Min 24/7 SLA', 'S. Murugan', 22, 'Active Retainer')
ON CONFLICT DO NOTHING;

-- Seed Initial Tickets
INSERT INTO public.tickets (id, company_name, customer_name, customer_email, device_or_subject, media_type, serial_number, status, cloned_percent, urgency, symptoms, tech_notes, assigned_bench, assigned_tech)
VALUES 
  ('TDD-8942', 'Apex Healthcare Diagnostic Center', 'Dr. Aravind Swaminathan', 'aravind@scandiagnostics.com', 'Seagate IronWolf 4TB SATA 3.5"', 'HDD', 'WDC-WMC4N0E83719', 'PC-3000 Raw Platter Mirrored Extraction', 99.8, 'Critical', 'Clicking head assembly. RAID 5 server primary disk failed during overnight MRI backup sync.', 'Cleanroom donor slider heads calibrated. Head 0-3 reading cleanly. 3.82TB cloned.', 'PC-3000 Channel 01 (Cleanroom Bench A)', 'S. Murugan (Cleanroom Lead)'),
  ('TDD-8943', 'Nexus Legal Advisors LLP', 'K. V. Sundaram', 'sundaram@nexuslegal.in', 'Samsung 980 Pro NVMe 2TB M.2', 'SSD', 'S6B0NS0W102948F', 'Firmware Virtual Translator Rebuild', 74.5, 'High', 'Drive locked in 0MB read-only state. BitLocker recovery key available.', 'Elpis controller locked in safe-mode. Bypassing bad NAND blocks in bank 2.', 'PC-3000 Portable III NVMe Station', 'S. Murugan (Cleanroom Lead)'),
  ('TDD-8944', 'Metropolitan Logistics Warehousing', 'M. Rajesh Kumar', 'rajesh@metrologistics.com', 'QNAP TS-453D 4-Bay RAID 5 (WD Red Plus 4TB x4)', 'RAID', 'QNP-RAID-9921', 'Hex Pattern XOR Parity Reconstruction', 42.0, 'Critical', 'Two drives dropped offline simultaneously after power surge. ERP database inaccessible.', 'Disk 2 dropped out 2 months ago, Disk 4 failed yesterday. Rebuilding missing blocks via XOR parity algorithm.', 'Forensic Hex Server Rack 04', 'S. Murugan (Cleanroom Lead)'),
  ('TDD-8945', 'Horizon Architecture Studio', 'Priya Ramanathan', 'priya@horizonarch.com', 'SanDisk Extreme Portable SSD 1TB', 'FLASH', 'SD-EXT-552910A', 'Initial Hardware Intake & Diode Diagnostic', 10.0, 'Standard', 'Drive not recognized on USB-C port. LED light does not illuminate.', 'Checking TVS protection diodes on USB bridge board. Bridge bypass required.', 'Soldering & Micro-inspection Station', 'S. Murugan (Cleanroom Lead)')
ON CONFLICT DO NOTHING;

-- Seed Initial Ticket Messages
INSERT INTO public.ticket_messages (ticket_id, sender, author, text)
VALUES 
  ('TDD-8942', 'Customer', 'Dr. Aravind Swaminathan', 'Please help recover patient MRI DICOM archives from the crashed Seagate 4TB server drive immediately.'),
  ('TDD-8942', 'Technician', 'S. Murugan (Cleanroom Lead)', 'Device logged in cleanroom vault. Starting donor slider matching under ISO Class-5 laminar air bench.'),
  ('TDD-8942', 'Technician', 'S. Murugan (Cleanroom Lead)', 'Donor heads swapped successfully. PC-3000 mirror imaging is now 99.8% complete with clean sectors.')
ON CONFLICT DO NOTHING;
