import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    backendUser?: {
      id: number;
      email: string;
      name?: string;
      avatar?: string;
      googleId?: string;
    }
  }

  interface JWT {
    backendUserId?: number;
    backendUser?: {
      id: number;
      email: string;
      name?: string;
      avatar?: string;
      googleId?: string;
    }
  }
}
