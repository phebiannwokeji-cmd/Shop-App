import '../src/index.css';
import { AuthProvider } from '../src/context/AuthContext';
import { DataProvider } from '../src/context/DataContext';
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
        <AuthProvider>
          <DataProvider>
            <AppShell>
              {children}
            </AppShell>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
