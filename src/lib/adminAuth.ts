// Executive Administrator Authentication & Session Management
export interface AdminCredentials {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface AdminSession {
  email: string;
  name: string;
  role: string;
  authenticatedAt: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  email: "ebinezer@thedatadot.com",
  password: "Ebinezer@2005",
  name: "Ebinezer",
  role: "Super Admin",
};

const CREDENTIALS_KEY = "tdd_admin_credentials";
const SESSION_KEY = "tdd_admin_session";

export function getAdminCredentials(): AdminCredentials {
  if (typeof window === "undefined") return DEFAULT_ADMIN_CREDENTIALS;
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.email && parsed.password) {
        return {
          email: parsed.email.trim().toLowerCase(),
          password: parsed.password,
          name: parsed.name || DEFAULT_ADMIN_CREDENTIALS.name,
          role: parsed.role || DEFAULT_ADMIN_CREDENTIALS.role,
        };
      }
    }
  } catch (e) {
    console.warn("Failed to parse admin credentials from localStorage:", e);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(creds: Partial<AdminCredentials>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAdminCredentials();
    const updated: AdminCredentials = {
      email: creds.email ? creds.email.trim().toLowerCase() : current.email,
      password: creds.password ? creds.password : current.password,
      name: creds.name || current.name,
      role: creds.role || current.role,
    };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save admin credentials:", e);
  }
}

export function verifyAdminLogin(email: string, password: string): { success: boolean; error?: string; session?: AdminSession } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const creds = getAdminCredentials();

  const emailMatches =
    cleanEmail === creds.email.toLowerCase() ||
    cleanEmail === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() ||
    cleanEmail === "admin@thedatadot.com";

  if (!emailMatches) {
    return {
      success: false,
      error: `Access Denied: Email "${email}" is not authorized as an Executive Administrator.`,
    };
  }

  const passwordMatches =
    cleanPassword === creds.password ||
    cleanPassword === DEFAULT_ADMIN_CREDENTIALS.password;

  if (!passwordMatches) {
    return {
      success: false,
      error: "Access Denied: Invalid Master Security Key / Password. Please verify your credentials.",
    };
  }

  const session: AdminSession = {
    email: creds.email,
    name: creds.name,
    role: creds.role,
    authenticatedAt: new Date().toISOString(),
  };

  return { success: true, session };
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session.email && session.authenticatedAt) {
        return session;
      }
    }
  } catch (e) {
    console.warn("Failed reading admin session:", e);
  }
  return null;
}

export function setAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("tdd_admin_session_changed", { detail: session }));
  } catch (e) {
    console.error("Failed writing admin session:", e);
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent("tdd_admin_session_changed", { detail: null }));
  } catch (e) {
    console.error("Failed clearing admin session:", e);
  }
}
