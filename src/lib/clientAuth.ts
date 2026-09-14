// Enterprise Client-Side Customer Session & Authorization Engine

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  accountNumber: string;
  slaTier: string;
  password?: string;
  status?: string;
  activeTickets?: number;
}

// Pre-authorized enterprise clients in directory with initial access keys
export const DEFAULT_AUTHORIZED_ACCOUNTS: Record<string, CustomerUser> = {
  "ebinezer@thedatadot.com": {
    id: "CUST-1001",
    name: "Ebinezer",
    email: "ebinezer@thedatadot.com",
    company: "The Data Dot Client Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-1001",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
  },
  "support@thedatadot.com": {
    id: "CUST-0001",
    name: "Enterprise Admin",
    email: "support@thedatadot.com",
    company: "The Data Dot Engineering Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-0001",
    slaTier: "Internal Super Admin SLA",
    password: "Password@123",
    status: "Active",
  },
  "aravind@scandiagnostics.com": {
    id: "CUST-8492",
    name: "Dr. Aravind Swaminathan",
    email: "aravind@scandiagnostics.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8492",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
  },
  "aravind@apexhealth.com": {
    id: "CUST-8493",
    name: "Dr. Aravind Swaminathan",
    email: "aravind@apexhealth.com",
    company: "Apex Healthcare Diagnostic Center",
    phone: "+91 98402 11928",
    accountNumber: "TDD-CLI-8493",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
  },
  "sundaram@nexuslegal.in": {
    id: "CUST-9021",
    name: "Advocate K. V. Sundaram",
    email: "sundaram@nexuslegal.in",
    company: "Nexus Legal Advisors LLP",
    phone: "+91 94441 82910",
    accountNumber: "TDD-CLI-9021",
    slaTier: "Priority 4-Hour Response",
    password: "Password@123",
    status: "Active",
  },
  "rajesh@metrologistics.com": {
    id: "CUST-6614",
    name: "M. Rajesh Kumar",
    email: "rajesh@metrologistics.com",
    company: "Metropolitan Logistics Warehousing",
    phone: "+91 97909 34120",
    accountNumber: "TDD-CLI-6614",
    slaTier: "Enterprise 15-Min 24/7 SLA",
    password: "Password@123",
    status: "Active",
  },
};

/**
 * Retrieves all registered authorized accounts (presets + dynamically provisioned)
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
    console.warn("Failed to load registered accounts from storage:", e);
  }

  return accounts;
}

/**
 * Synchronizes provisioned client accounts with backend API
 */
export async function syncAuthorizedAccountsFromServer(): Promise<Record<string, CustomerUser>> {
  const accounts = getAuthorizedAccounts();
  if (typeof window === "undefined") return accounts;

  try {
    const res = await fetch("/api/customers");
    const data = await res.json();
    if (data?.success && Array.isArray(data.customers)) {
      for (const cust of data.customers) {
        if (cust.email) {
          const normEmail = cust.email.toLowerCase();
          accounts[normEmail] = {
            id: cust.id,
            name: cust.name,
            email: normEmail,
            company: cust.company,
            phone: cust.phone,
            accountNumber: cust.accountNumber,
            slaTier: cust.slaTier,
            password: cust.password,
            status: cust.status,
          };
        }
      }
      localStorage.setItem("tdd_registered_customers", JSON.stringify(accounts));
    }
  } catch (err) {
    console.warn("Server accounts sync fallback warning:", err);
  }

  return accounts;
}

/**
 * Registers / provisions a new customer account
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

  // Check local cache
  let authorizedUser = isAccountAuthorized(normalizedEmail);

  // If not found locally, attempt to sync from server (in case Super Admin just provisioned it)
  if (!authorizedUser) {
    const freshAccounts = await syncAuthorizedAccountsFromServer();
    authorizedUser = freshAccounts[normalizedEmail] || null;
  }

  // If still not found, deny access
  if (!authorizedUser) {
    return {
      success: false,
      error:
        "Access Denied: No provisioned account found for this email. Client portal access is restricted to verified enterprise clients. Please contact your account manager or support@thedatadot.com.",
    };
  }

  // Password verification
  if (authorizedUser.password && password) {
    const trimmedInput = password.trim();
    const trimmedStored = authorizedUser.password.trim();
    if (trimmedInput !== trimmedStored) {
      return {
        success: false,
        error: "Invalid password. Please check your credentials or contact your administrator to reset access.",
      };
    }
  } else if (authorizedUser.password && !password) {
    return {
      success: false,
      error: "Please enter your account password.",
    };
  }

  // Save session
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

export function deleteCustomerAccount(email: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getAuthorizedAccounts();
    const normalized = email.toLowerCase().trim();
    if (existing[normalized]) {
      delete existing[normalized];
      localStorage.setItem("tdd_registered_customers", JSON.stringify(existing));
    }
  } catch (e) {
    console.warn("Failed to delete account from storage:", e);
  }
}

