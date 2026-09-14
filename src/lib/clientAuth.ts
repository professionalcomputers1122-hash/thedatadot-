// Client-Side Dynamic Customer Session Manager

export interface CustomerUser {
  name: string;
  email: string;
  company: string;
  phone: string;
  accountNumber: string;
  slaTier: string;
}

const PRESET_ACCOUNTS: Record<string, CustomerUser> = {
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
 * Creates a dynamic customer account structure from any business email
 */
export function buildCustomerProfileFromEmail(email: string): CustomerUser {
  const normalizedEmail = email.trim().toLowerCase();

  // Return known preset if matched
  if (PRESET_ACCOUNTS[normalizedEmail]) {
    return PRESET_ACCOUNTS[normalizedEmail];
  }

  // Parse email parts
  const [userPart, domainPart] = normalizedEmail.split("@");

  // Format Name (e.g. "ebinezer" -> "Ebinezer", "john.doe" -> "John Doe")
  const formattedName = (userPart || "Client User")
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Format Company Name from domain (e.g. "thedatadot.com" -> "The Data Dot")
  const domainClean = (domainPart || "Enterprise")
    .split(".")[0]
    .replace(/[-_]+/g, " ");
  const formattedCompany =
    domainClean.toLowerCase() === "thedatadot"
      ? "The Data Dot Client Desk"
      : domainClean
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") + " Technologies";

  // Generate deterministic account number
  let hash = 0;
  for (let i = 0; i < normalizedEmail.length; i++) {
    hash = (hash << 5) - hash + normalizedEmail.charCodeAt(i);
    hash |= 0;
  }
  const accountNum = Math.abs(hash % 9000) + 1000;

  return {
    name: formattedName,
    email: normalizedEmail,
    company: formattedCompany,
    phone: "+91 6380488373",
    accountNumber: `TDD-CLI-${accountNum}`,
    slaTier: "Enterprise Priority SLA",
  };
}

export function getCustomerSession(): CustomerUser {
  if (typeof window === "undefined") {
    return PRESET_ACCOUNTS["aravind@scandiagnostics.com"];
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

  return PRESET_ACCOUNTS["aravind@scandiagnostics.com"];
}

export async function loginCustomer(email: string, name?: string): Promise<CustomerUser> {
  const profile = buildCustomerProfileFromEmail(email);
  if (name && name.trim()) {
    profile.name = name.trim();
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("tdd_customer_session", JSON.stringify(profile));
  }

  // Also notify server /api/auth
  try {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        name: profile.name,
        role: "customer",
      }),
    });
  } catch (err) {
    console.warn("Failed to set server auth cookie:", err);
  }

  return profile;
}

export function updateCustomerSession(updates: Partial<CustomerUser>): CustomerUser {
  const current = getCustomerSession();
  const updated = { ...current, ...updates };

  if (typeof window !== "undefined") {
    localStorage.setItem("tdd_customer_session", JSON.stringify(updated));
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
