import { AuthProvider } from '../contexts/AuthContext';
import AuthWrapper from './AuthWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </AuthProvider>
  );
}
