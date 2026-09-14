-- ==========================================================
-- THE DATA DOT - BACKEND DATABASE AUTOMATION & TRIGGERS
-- Run this in your Supabase SQL Editor
-- ==========================================================

-- 1. FUNCTION: Automatically Update updated_at Timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at on public.tickets
DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();


-- 2. FUNCTION & TRIGGER: Automatic Immutable Audit Logging on Ticket Changes
-- Captures state changes (status, cloned %, technician) directly in PostgreSQL
CREATE OR REPLACE FUNCTION public.log_ticket_state_change()
RETURNS TRIGGER AS $$
DECLARE
  v_change_details TEXT := '';
  v_actor TEXT := 'System Automation';
BEGIN
  -- Detect status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_change_details := v_change_details || format('Status changed from "%s" to "%s". ', OLD.status, NEW.status);
  END IF;

  -- Detect PC-3000 cloned percentage change
  IF OLD.cloned_percent IS DISTINCT FROM NEW.cloned_percent THEN
    v_change_details := v_change_details || format('Cloned percent updated from %s%% to %s%%. ', OLD.cloned_percent, NEW.cloned_percent);
  END IF;

  -- Detect technician bench reassignment
  IF OLD.assigned_tech IS DISTINCT FROM NEW.assigned_tech THEN
    v_change_details := v_change_details || format('Technician reassigned from "%s" to "%s". ', OLD.assigned_tech, NEW.assigned_tech);
  END IF;

  -- If any monitored column changed, record immutable audit entry
  IF v_change_details <> '' THEN
    IF NEW.assigned_tech IS NOT NULL THEN
      v_actor := NEW.assigned_tech;
    END IF;

    INSERT INTO public.audit_logs (id, actor, action, target, ip, created_at)
    VALUES (
      'LOG-DB-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
      v_actor,
      'DATABASE_TRIGGER_UPDATE',
      format('Ticket #%s: %s', NEW.id, trim(v_change_details)),
      '127.0.0.1 (PostgreSQL Engine)',
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to public.tickets
DROP TRIGGER IF EXISTS trg_log_ticket_changes ON public.tickets;
CREATE TRIGGER trg_log_ticket_changes
AFTER UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.log_ticket_state_change();
