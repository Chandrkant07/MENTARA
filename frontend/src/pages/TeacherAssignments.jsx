import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/layout/AppShell';
import TeacherNav from '../components/layout/TeacherNav';
import ThemeToggle from '../components/ui/ThemeToggle';
import AssignmentsManager from '../components/learning/AssignmentsManager';

export default function TeacherAssignments() {
  const { user, logout } = useAuth();

  return (
    <AppShell
      brandTitle="Mentara"
      brandSubtitle="Teacher"
      nav={<TeacherNav active="assignments" />}
      right={(
        <>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-text">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
            <button onClick={logout} className="btn-secondary text-sm">Logout</button>
          </div>
        </>
      )}
    >
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <AssignmentsManager />
      </motion.div>
    </AppShell>
  );
}
