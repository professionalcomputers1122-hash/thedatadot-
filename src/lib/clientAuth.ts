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

// Fallback seed presets (WITHOUT universal passwords)
export const SEED_ACCOUNTS: Record<string, CustomerUser> = {
  "support@thedatadot.com": {
    id: "CUST-0001",
    name: "Enterprise Admin",
    email: "support@thedatadot.com",
    company: "The Data Dot Engineering Desk",
    phone: "+91 6380488373",
    accountNumber: "TDD-CLI-0001",
    slaTier: "Internal Super Admin SLA",
    password: "Admin@DataDot2026!",
    status: "Active",
  },
};

/**
 * Retrieves list of emails deleted by administrator to prevent zombie logins
 */
export function getDeletedEmails(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("tdd_deleted_emails");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map((e: string) => e.toLowerCase().trim()));
      }
    }
  } catch (e) {
    console.warn("Failed to read deleted emails list:", e);
  }
  return new Set();
}

/**
 * Retrieves all registered authorized accounts from storage
 */
export function getAuthorizedAccounts(): Record<string, CustomerUser> {
  const accounts: Record<string, CustomerUser> = { ...SEED_ACCOUNTS };
  if (typeof window === "undefined") return accounts;

  const deletedSet = getDeletedEmails();

  try {
    const raw = localStorage.getItem("tdd_registered_customers");
    if (raw) {
      const custom: Record<string, CustomerUser> = JSON.parse(raw);
      for (const [key, val] of Object.entries(custom)) {
        const normKey = key.toLowerCase().trim();
        if (!deletedSet.has(normKey)) {
          accounts[normKey] = val;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load registered accounts from storage:", e);
  }

  // Ensure deleted accounts are purged
  for (const deletedEmail of Array.from(deletedSet)) {
    delete accounts[deletedEmail];
  }

  return accounts;
}

/**
 * Synchronizes provisioned client accounts with backend API (Supabase)
 */
export async function syncAuthorizedAccountsFromServer(): Promise<Record<string, CustomerUser>> {
  const accounts: Record<string, CustomerUser> = { ...SEED_ACCOUNTS };
  if (typeof window === "undefined") return accounts;

  const deletedSet = getDeletedEmails();

  try {
    const res = await fetch("/api/customers");
    const data = await res.json();
    if (data?.success && Array.isArray(data.customers)) {
      for (const cust of data.customers) {
        if (cust.email) {
          const normEmail = cust.email.toLowerCase().trim();
          if (!deletedSet.has(normEmail)) {
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
      }
      localStorage.setItem("tdd_registered_customers", JSON.stringify(accounts));
    }
  } catch (err) {
    console.warn("Server accounts sync warning:", err);
  }

  return accounts;
}

/**
 * Registers / provisions a new customer account
 */
export function registerCustomerAccount(account: CustomerUser) {
  if (typeof window === "undefined") return;
  try {
    const normEmail = account.email.toLowerCase().trim();
    const existing = getAuthorizedAccounts();
    existing[normEmail] = account;

    // Remove from deleted list if re-provisioned
    const deletedSet = getDeletedEmails();
    if (deletedSet.has(normEmail)) {
      deletedSet.delete(normEmail);
      localStorage.setItem("tdd_deleted_emails", JSON.stringify(Array.from(deletedSet)));
    }

    localStorage.setItem("tdd_registered_customers", JSON.stringify(existing));
  } catch (e) {
    console.warn("Failed to save registered account:", e);
  }
}

/**
 * Completely removes a customer account and revokes access
 */
export function deleteCustomerAccount(email: string) {
  if (typeof window === "undefined") return;
  try {
    const normEmail = email.toLowerCase().trim();
    const existing = getAuthorizedAccounts();
    delete existing[normEmail];
    localStorage.setItem("tdd_registered_customers", JSON.stringify(existing));

    // Record in deleted blacklist
    const deletedSet = getDeletedEmails();
    deletedSet.add(normEmail);
    localStorage.setItem("tdd_deleted_emails", JSON.stringify(Array.from(deletedSet)));

    // Terminate session if this user was logged in
    const activeSession = getCustomerSession();
    if (activeSession && activeSession.email.toLowerCase().trim() === normEmail) {
      localStorage.removeItem("tdd_customer_session");
      fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    }
  } catch (e) {
    console.warn("Failed to delete account from storage:", e);
  }
}

/**
 * Verifies if an email is registered and authorized to access the Customer Portal
 */
export function isAccountAuthorized(email: string): CustomerUser | null {
  const normalized = email.trim().toLowerCase();
  const deletedSet = getDeletedEmails();
  if (deletedSet.has(normalized)) return null;

  const accounts = getAuthorizedAccounts();
  return accounts[normalized] || null;
}

/**
 * Returns current customer session if logged in.
 * STRICT: Returns NULL if no active session exists
 */
export function getCustomerSession(): CustomerUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("tdd_customer_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) {
        const deletedSet = getDeletedEmails();
        if (deletedSet.has(parsed.email.toLowerCase().trim())) {
          // Purge session for deleted user
          localStorage.removeItem("tdd_customer_session");
          return null;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed reading customer session:", e);
  }

  return null;
}

/**
 * Authenticates customer credentials and establishes secure session
 * Strictly enforces individual password set by Super Admin (No universal passkeys)
 */
export async function loginCustomer(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if user is in deleted accounts
  const deletedSet = getDeletedEmails();
  if (deletedSet.has(normalizedEmail)) {
    return {
      success: false,
      error: "Access Denied: This customer account was removed by the administrator.",
    };
  }

  if (!password || password.trim().length === 0) {
    return {
      success: false,
      error: "Please enter your account password.",
    };
  }

  // 2. Sync fresh accounts from Supabase server
  let authorizedUser: CustomerUser | null = null;
  try {
    const freshAccounts = await syncAuthorizedAccountsFromServer();
    authorizedUser = freshAccounts[normalizedEmail] || null;
  } catch {
    authorizedUser = isAccountAuthorized(normalizedEmail);
  }

  // 3. Reject if not provisioned
  if (!authorizedUser) {
    return {
      success: false,
      error:
        "Access Denied: No active account found for this email. Portal access is provisioned exclusively by The Data Dot Administration upon onboarding.",
    };
  }

  // 4. Strict Individual Password Verification
  const expectedPassword = authorizedUser.password?.trim();
  const enteredPassword = password.trim();

  if (!expectedPassword || enteredPassword !== expectedPassword) {
    return {
      success: false,
      error: "Invalid password. Please enter the password provisioned by your administrator.",
    };
  }

  // 5. Establish secure session
  if (typeof window !== "undefined") {
    localStorage.setItem("tdd_customer_session", JSON.stringify(authorizedUser));
  }

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
