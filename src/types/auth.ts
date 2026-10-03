export interface AuthUser {
  id: string;
  username: string;
  email: string;
  targetYear?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface StoredAccount extends AuthUser {
  passwordHash: string;
}
