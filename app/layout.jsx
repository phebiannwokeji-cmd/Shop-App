import '../src/index.css';
import { Providers } from './providers';
import { AppShell } from './AppShell';

export const metadata = {
  title: 'Grace & Mercy Store — Shared Record Book',
  description: 'A single shop shared record book for trust from a distance. Tracks sales, expenses, customer debts, and stock with immutable audit logging.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
