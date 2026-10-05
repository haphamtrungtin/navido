export type AdminActor = {
  userId: string;
  email: string;
  role: 'owner' | 'staff';
};
export type AdminAccess =
  | { status: 'allowed'; actor: AdminActor }
  | { status: 'unauthenticated' | 'forbidden' | 'unavailable' };
export type LoginState = {
  error:
    | 'invalid_input'
    | 'invalid_credentials'
    | 'forbidden'
    | 'unavailable'
    | null;
};
export type LogoutState = { error: 'unavailable' | null };

export class AdminAccessError extends Error {
  constructor(
    public readonly status: 'unauthenticated' | 'forbidden' | 'unavailable',
  ) {
    super('Admin access denied');
  }
}
