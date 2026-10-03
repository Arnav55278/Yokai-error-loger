import { AuthUser, StoredAccount } from "../types/auth";

const USERS_STORAGE_KEY = "apex_auth_accounts_v1";
const SESSION_STORAGE_KEY = "apex_auth_current_session_v1";

// Simple SHA-256 hash using native Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_apex_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse stored accounts:", err);
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to save accounts:", err);
  }
}

const AVATAR_COLORS = [
  "#38bdf8", // Sky
  "#a855f7", // Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
];

export async function registerUser(params: {
  username: string;
  email: string;
  password: string;
  targetYear?: string;
}): Promise<AuthUser> {
  const username = params.username.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!username) {
    throw new Error("Username is required.");
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    throw new Error("Please enter a valid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email);
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const passwordHash = await hashPassword(password);
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newUser: StoredAccount = {
    id: `USER-${Date.now().toString(36).toUpperCase()}`,
    username,
    email,
    targetYear: params.targetYear || "JEE Advanced 2026",
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);

  const authUser: AuthUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    targetYear: newUser.targetYear,
    avatarColor: newUser.avatarColor,
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
  return authUser;
}

export async function loginUser(emailInput: string, passwordInput: string): Promise<AuthUser> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (!email) {
    throw new Error("Please enter your email.");
  }
  if (!password) {
    throw new Error("Please enter your password.");
  }

  const accounts = getStoredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email);
  if (!account) {
    throw new Error("No account found with this email. Please create an account first.");
  }

  const inputHash = await hashPassword(password);
  if (inputHash !== account.passwordHash) {
    throw new Error("Incorrect password. Please try again.");
  }

  const authUser: AuthUser = {
    id: account.id,
    username: account.username,
    email: account.email,
    targetYear: account.targetYear,
    avatarColor: account.avatarColor,
    createdAt: account.createdAt,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
  return authUser;
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load current session:", err);
    return null;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}

export function hasAnyRegisteredAccounts(): boolean {
  const accounts = getStoredAccounts();
  return accounts.length > 0;
}

export function getRegisteredAccountsList(): { email: string; username: string; avatarColor?: string }[] {
  return getStoredAccounts().map((a) => ({
    email: a.email,
    username: a.username,
    avatarColor: a.avatarColor,
  }));
}
