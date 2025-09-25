import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const USERS = [
  { id: 'u1', username: 'mossy' },
  { id: 'u2', username: 'eleni' },
  { id: 'u3', username: 'fotis' },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, // 30 days
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { username: { label: 'Username', type: 'text' } },
      async authorize(credentials) {
        const u = (credentials?.username || '').trim().toLowerCase();
        const user = USERS.find(x => x.username === u);
        if (user) return { id: user.id, name: user.username };
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) token.username = user.name;
      return token;
    },
    async session({ session, token }) {
      if (token?.username) {
        session.user = { ...session.user, name: token.username } as any;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
