import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  defaultSession,
  type CountMode,
  type MockSession,
  type SessionRole,
  type SiteCountMode,
} from '../data/session';

interface SessionContextValue {
  session: MockSession;
  setAuthenticated: (value: boolean) => void;
  setRole: (role: SessionRole) => void;
  setSiteCountMode: (mode: SiteCountMode) => void;
  setSchoolCountMode: (mode: CountMode) => void;
  updateSession: (patch: Partial<MockSession>) => void;
  login: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession>(defaultSession);

  const updateSession = useCallback((patch: Partial<MockSession>) => {
    setSession((prev) => ({ ...prev, ...patch }));
  }, []);

  const setAuthenticated = useCallback((value: boolean) => {
    setSession((prev) => ({ ...prev, isAuthenticated: value }));
  }, []);

  const setRole = useCallback((role: SessionRole) => {
    setSession((prev) => ({ ...prev, role }));
  }, []);

  const setSiteCountMode = useCallback((siteCountMode: SiteCountMode) => {
    setSession((prev) => ({ ...prev, siteCountMode }));
  }, []);

  const setSchoolCountMode = useCallback((schoolCountMode: CountMode) => {
    setSession((prev) => ({ ...prev, schoolCountMode }));
  }, []);

  const login = useCallback(() => {
    setSession((prev) => ({ ...prev, isAuthenticated: true }));
  }, []);

  const logout = useCallback(() => {
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
  }, []);

  const value = useMemo(
    () => ({
      session,
      setAuthenticated,
      setRole,
      setSiteCountMode,
      setSchoolCountMode,
      updateSession,
      login,
      logout,
    }),
    [
      session,
      setAuthenticated,
      setRole,
      setSiteCountMode,
      setSchoolCountMode,
      updateSession,
      login,
      logout,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
