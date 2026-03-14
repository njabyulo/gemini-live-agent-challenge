export interface ISessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface ISessionSummary {
  user: ISessionUser;
  session: {
    id: string;
    expiresAt: string;
  };
}
