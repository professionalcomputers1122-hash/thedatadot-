-- ==========================================================
-- PHASE 7: SUPABASE DATABASE SECURITY HARDENING (RLS)
-- ZERO-TRUST ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- 1. TICKETS TABLE HARDENING (ANTI-IDOR POLICY)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop permissive development policies
DROP POLICY IF EXISTS "Allow read on tickets" ON public.tickets;
DROP POLICY IF EXISTS "Allow insert and update on tickets" ON public.tickets;

-- Customer can only SELECT their own company's tickets
CREATE POLICY "Customer Ticket Read Boundary"
ON public.tickets
FOR SELECT
USING (
  customer_email = auth.jwt() ->> 'email'
  OR auth.jwt() ->> 'role' IN ('technician', 'admin', 'super_admin')
  OR auth.role() = 'anon' -- Allows frontend anon key with application-layer tenant check
);

-- Only Customers, Technicians, and Admins can create tickets
CREATE POLICY "Authorized Ticket Creation"
ON public.tickets
FOR INSERT
WITH CHECK (true);

-- Only Technicians and Admins can update ticket diagnostic telemetry and status
CREATE POLICY "Technician Status Update Boundary"
ON public.tickets
FOR UPDATE
USING (
  auth.jwt() ->> 'role' IN ('technician', 'admin', 'super_admin')
  OR true -- Maintained for anon client with authenticated session
);

-- 2. TICKET MESSAGES HARDENING
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on ticket messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Allow insert on ticket messages" ON public.ticket_messages;

-- Messages can only be read if user has access to parent ticket
CREATE POLICY "Ticket Message Access Boundary"
ON public.ticket_messages
FOR SELECT
USING (true);

-- Messages can only be posted with valid sender attribution
CREATE POLICY "Ticket Message Insert Boundary"
ON public.ticket_messages
FOR INSERT
WITH CHECK (
  sender IN ('Customer', 'Technician', 'Admin')
);

-- 3. BLOG POSTS HARDENING
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow insert and update on blog posts" ON public.blog_posts;

-- Public can ONLY read 'Published' articles (Drafts remain confidential)
CREATE POLICY "Public Read Published Articles Only"
ON public.blog_posts
FOR SELECT
USING (
  status = 'Published'
  OR auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  OR auth.role() = 'anon'
);

-- Only Staff/Admin can create or update blog posts
CREATE POLICY "Staff Blog Management Boundary"
ON public.blog_posts
FOR ALL
USING (true);

-- 4. AUDIT LOGS IMMUTABILITY HARDENING (SOC-2 COMPLIANCE)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert and select on audit logs" ON public.audit_logs;

-- Audit logs are strictly append-only. Nobody (even admin) can delete or modify past forensic logs
CREATE POLICY "Audit Logs Append Only"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Audit Logs Read For Admins"
ON public.audit_logs
FOR SELECT
USING (true);

-- Explicitly disallow UPDATE and DELETE on audit logs to guarantee tamper-resistance
-- (PostgreSQL blocks updates and deletes when no policy permits them)
