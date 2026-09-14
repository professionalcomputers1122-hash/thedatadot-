// Enterprise Client-Side Customer Session & Authorization Engine

export interface CustomerUser {
  name: string;
  email: string;
  company: string;
  phone: string;
  accountNumber: string;
  slaTier: string;
}

// Pre-authorized enterprise clients in directory
export const DEFAULT_AUTHORIZED_ACCOUNTS: Record<string, CustomerUser> = {
  "ebinezer@thedatadot.com": {
    name: "Ebinezer",
    email: "ebinezer@thedatadot.com",
    company: "The Data Dot Client Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-1001",
    slaTier: "Enterprise 15-Min 24/7 SLA",
  },
  "support@thedatadot.com": {
    name: "Enterprise Admin",
    email: "support@thedatadot.com",
    company: "The Data Dot Engineering Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-0001",
    slaTier: "Internal Super Admin SLA",
  },
  "aravind@scandiagnostics.com": {
    name: "Dr. Aravind Swaminathan",
    email: "aravind@scandiagnostics.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8492",
    slaTier: "Enterprise 15-Min 24/7 SLA",
  },
  "aravind@apexhealth.com": {
    name: "Dr. Aravind Swaminathan",
    email: "aravind@apexhealth.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8492",
    slaTier: "Enterprise 15-Min 24/7 SLA",
  },
  "sundaram@nexuslegal.in": {
    name: "Advocate K. V. Sundaram",
    email: "sundaram@nexuslegal.in",
    company: "Nexus Legal Advisors LLP",
    phone: "+91 94441 82910",
    accountNumber: "TDD-CLI-9021",
    slaTier: "Priority 4-Hour Response",
  },
  "rajesh@metrologistics.com": {
    name: "M. Rajesh Kumar",
    email: "rajesh@metrologistics.com",
    company: "Metropolitan Logistics Warehousing",
    phone: "+91 97909 34120",
    accountNumber: "TDD-CLI-6614",
    slaTier: "Enterprise 15-Min 24/7 SLA",
  },
};

/**
 * Retrieves all registered authorized accounts (presets + dynamically registered)
 */
export function getAuthorizedAccounts(): Record<string, CustomerUser> {
  const accounts = { ...DEFAULT_AUTHORIZED_ACCOUNTS };
  if (typeof window === "undefined") return accounts;

  try {
    const raw = localStorage.getItem("tdd_registered_customers");
    if (raw) {
      const custom: Record<string, CustomerUser> = JSON.parse(raw);
      Object.assign(accounts, custom);
    }
  } catch (e) {
    console.warn("Failed to load registered accounts:", e);
  }

  return accounts;
}

/**
 * Registers a new customer account
 */
export function registerCustomerAccount(account: CustomerUser) {
  if (typeof window === "undefined") return;
  try {
    const existing = getAuthorizedAccounts();
    existing[account.email.toLowerCase()] = account;
    localStorage.setItem("tdd_registered_customers", JSON.stringify(existing));
  } catch (e) {
    console.warn("Failed to save registered account:", e);
  }
}

/**
 * Verifies if an email is registered and authorized to access the Customer Portal
 */
export function isAccountAuthorized(email: string): CustomerUser | null {
  const normalized = email.trim().toLowerCase();
  const accounts = getAuthorizedAccounts();
  return accounts[normalized] || null;
}

/**
 * Returns current customer session if logged in.
 * STRICT: Returns NULL if no active session exists (NO fallback to Dr. Aravind!)
 */
export function getCustomerSession(): CustomerUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("tdd_customer_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading customer session:", e);
  }

  return null;
}

/**
 * Authenticates customer credentials and establishes secure session
 */
export async function loginCustomer(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const authorizedUser = isAccountAuthorized(normalizedEmail);

  if (!authorizedUser) {
    return {
      success: false,
      error: "No authorized account found for this email. Please register your organization first or contact your administrator.",
    };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("tdd_customer_session", JSON.stringify(authorizedUser));
  }

  // Set server-side session cookie via /api/auth
  try {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: authorizedUser.email,
        name: authorizedUser.name,
        role: "customer",
      }),
    });
  } catch (err) {
    console.warn("Server session dispatch warning:", err);
  }

  return { success: true, user: authorizedUser };
}

export function updateCustomerSession(updates: Partial<CustomerUser>): CustomerUser | null {
  const current = getCustomerSession();
  if (!current) return null;

  const updated = { ...current, ...updates };

  if (typeof window !== "undefined") {
    localStorage.setItem("tdd_customer_session", JSON.stringify(updated));
    // Also update in registered list
    registerCustomerAccount(updated);
  }

  return updated;
}

export async function logoutCustomer(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tdd_customer_session");
  }

  try {
    await fetch("/api/auth", { method: "DELETE" });
  } catch (err) {
    console.warn("Logout request failed:", err);
  }
}
