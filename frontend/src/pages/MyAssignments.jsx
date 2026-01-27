import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, FileText, Lock, CheckCircle2, Clock, ListFilter, Search } from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/layout/AppShell';
import StudentNav from '../components/layout/StudentNav';
import ThemeToggle from '../components/ui/ThemeToggle';

const STATUS = {
  LOCKED: 'LOCKED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
};

const VIEW = {
  TODO: 'TODO',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  ALL: 'ALL',
};

const TYPE = {
  ALL: 'ALL',
  MATERIAL: 'MATERIAL',
  MOCK_TEST: 'MOCK_TEST',
};

const formatDateTime = (value) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const badgeClassForStatus = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === STATUS.COMPLETED) return 'bg-success/15 text-success border-success/30';
  if (s === STATUS.EXPIRED) return 'bg-danger/15 text-danger border-danger/30';
  if (s === STATUS.LOCKED) return 'bg-warning/15 text-warning border-warning/30';
  return 'bg-primary/15 text-primary border-primary/30';
};

const labelForStatus = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === STATUS.LOCKED) return 'Locked';
  if (s === STATUS.COMPLETED) return 'Completed';
  if (s === STATUS.EXPIRED) return 'Expired';
  return 'Active';
};

const labelForType = (assignmentType) => {
  const t = String(assignmentType || '').toUpperCase();
  if (t === TYPE.MATERIAL) return 'Material';
  if (t === TYPE.MOCK_TEST) return 'Mock Test';
  return t || 'Assignment';
};

const isLocked = (a) => String(a?.status || '').toUpperCase() === STATUS.LOCKED;
const isCompleted = (a) => String(a?.status || '').toUpperCase() === STATUS.COMPLETED;
const isExpired = (a) => String(a?.status || '').toUpperCase() === STATUS.EXPIRED;
const isPending = (a) => String(a?.status || '').toUpperCase() === STATUS.PENDING;

export default function MyAssignments() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [view, setView] = useState(VIEW.TODO);
  const [typeFilter, setTypeFilter] = useState(TYPE.ALL);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('my/assignments/');
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load assignments:', e);
      toast.error('Failed to load assignments');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { pending: 0, locked: 0, completed: 0, expired: 0 };
    for (const a of items || []) {
      const s = String(a?.status || STATUS.PENDING).toUpperCase();
      if (s === STATUS.PENDING) c.pending += 1;
      else if (s === STATUS.LOCKED) c.locked += 1;
      else if (s === STATUS.COMPLETED) c.completed += 1;
      else if (s === STATUS.EXPIRED) c.expired += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const type = String(typeFilter || TYPE.ALL).toUpperCase();

    return (items || [])
      .filter((a) => {
        const s = String(a?.status || STATUS.PENDING).toUpperCase();
        if (view === VIEW.TODO) {
          if (!(s === STATUS.PENDING || s === STATUS.LOCKED)) return false;
        } else if (view === VIEW.COMPLETED) {
          if (s !== STATUS.COMPLETED) return false;
        } else if (view === VIEW.EXPIRED) {
          if (s !== STATUS.EXPIRED) return false;
        }

        if (type !== TYPE.ALL) {
          if (String(a?.assignment_type || '').toUpperCase() !== type) return false;
        }

        if (!q) return true;
        const title = (String(a?.assignment_type || '').toUpperCase() === TYPE.MATERIAL)
          ? (a?.material_info?.title || '')
          : (a?.exam_info?.title || '');
        const desc = a?.material_info?.description || '';
        const hay = `${title} ${desc} ${a?.priority || ''} ${a?.assigned_by_role || ''}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        // Keep stable ordering by sequence then id.
        const sa = Number(a?.sequence_order || 0);
        const sb = Number(b?.sequence_order || 0);
        if (sa !== sb) return sa - sb;
        return Number(a?.id || 0) - Number(b?.id || 0);
      });
  }, [items, view, typeFilter, query]);

  const openMaterial = (a) => {
    const info = a?.material_info;
    const url = info?.file_url || info?.url;
    if (!url) {
      toast.error('No material link found');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const startTest = (a) => {
    const examId = a?.exam_info?.id || a?.exam;
    if (!examId) {
      toast.error('No test found for this assignment');
      return;
    }
    navigate(`/test/${examId}?assignment=${a.id}`);
  };

  const markCompleted = async (a) => {
    try {
      toast.loading('Marking completed…', { id: 'complete' });
      await api.post(`my/assignments/${a.id}/complete/`);
      toast.success('Marked completed', { id: 'complete' });
      await load();
    } catch (e) {
      console.error('Failed to complete assignment:', e);
      toast.error(e?.response?.data?.detail || 'Failed to mark completed', { id: 'complete' });
    }
  };

  const AssignmentCard = ({ a }) => {
    const assignmentType = String(a?.assignment_type || '').toUpperCase();
    const title = assignmentType === TYPE.MATERIAL ? (a?.material_info?.title || 'Material') : (a?.exam_info?.title || 'Mock Test');
    const description = assignmentType === TYPE.MATERIAL ? (a?.material_info?.description || '') : '';
    const status = String(a?.status || STATUS.PENDING).toUpperCase();
    const priority = String(a?.priority || 'OPTIONAL').toUpperCase();

    const locked = isLocked(a);
    const completed = isCompleted(a);
    const expired = isExpired(a);
    const pending = isPending(a);

    const icon = assignmentType === TYPE.MATERIAL ? BookOpen : FileText;
    const Icon = icon;

    const primaryAction = () => {
      if (assignmentType === TYPE.MATERIAL) return openMaterial(a);
      return startTest(a);
    };

    const primaryLabel = assignmentType === TYPE.MATERIAL ? 'Open' : 'Start Test';
    const disablePrimary = locked || expired;

    return (
      <div className="card-elevated p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-surface/50 border border-elevated/60 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClassForStatus(status)}`}>{labelForStatus(status)}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-surface/60 text-text-secondary border-elevated/60">
                  {labelForType(assignmentType)}
                </span>
                <span className={
                  priority === 'MANDATORY'
                    ? 'text-[11px] px-2 py-0.5 rounded-full border bg-danger/10 text-danger border-danger/30'
                    : 'text-[11px] px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30'
                }>
                  {priority}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-surface/60 text-text-secondary border-elevated/60">
                  Seq #{Number(a?.sequence_order || 0)}
                </span>
                {(a?.assigned_by_role || '').trim() ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border bg-surface/60 text-text-secondary border-elevated/60">
                    {String(a.assigned_by_role).toUpperCase()}
                  </span>
                ) : null}
              </div>

              <div className="mt-2">
                <h3 className="text-base sm:text-lg font-semibold text-text truncate">{title}</h3>
                {description ? (
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">{description}</p>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface/50 border border-elevated/60">
                  <Clock className="w-3.5 h-3.5" />
                  {a?.start_at ? `Starts ${formatDateTime(a.start_at)}` : 'Available now'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface/50 border border-elevated/60">
                  {a?.end_at ? `Ends ${formatDateTime(a.end_at)}` : 'No deadline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto sm:min-w-[160px]">
            <button
              className={disablePrimary ? 'btn-secondary text-sm opacity-70' : 'btn-premium text-sm'}
              onClick={primaryAction}
              disabled={disablePrimary}
            >
              {primaryLabel}
            </button>

            {assignmentType === TYPE.MATERIAL ? (
              <button
                className="btn-secondary text-sm"
                onClick={() => markCompleted(a)}
                disabled={!pending}
              >
                Mark Completed
              </button>
            ) : null}

            {completed ? (
              <div className="flex items-center justify-center gap-2 text-xs text-success mt-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </div>
            ) : null}
          </div>
        </div>

        {a?.blocked_by_sequence ? (
          <div className="mt-3 flex items-start gap-2 text-xs text-warning">
            <Lock className="w-4 h-4 mt-0.5" />
            Locked by sequence: complete earlier mandatory items first.
          </div>
        ) : null}
      </div>
    );
  };

  const headerRight = (
    <>
      <ThemeToggle />
      <button className="btn-secondary text-sm" onClick={load} disabled={loading}>
        {loading ? 'Loading…' : 'Refresh'}
      </button>
      <div className="hidden sm:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-text">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-text-secondary">{user?.email}</p>
        </div>
        <button onClick={logout} className="btn-secondary text-sm">Logout</button>
      </div>
    </>
  );

  return (
    <AppShell
      brandTitle="Mentara"
      brandSubtitle="Assignments"
      nav={<StudentNav active="assignments" />}
      right={headerRight}
    >
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="card-elevated p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">My Assignments</h1>
              <p className="text-text-secondary mt-1">Guided tasks assigned by Admin/Teacher</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border border-elevated/60">
                Active: <span className="text-text font-semibold">{counts.pending}</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border border-elevated/60">
                Locked: <span className="text-text font-semibold">{counts.locked}</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border border-elevated/60">
                Completed: <span className="text-text font-semibold">{counts.completed}</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/50 border border-elevated/60">
                Expired: <span className="text-text font-semibold">{counts.expired}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                className={view === VIEW.TODO ? 'btn-premium text-sm' : 'btn-secondary text-sm'}
                onClick={() => setView(VIEW.TODO)}
              >
                To Do
              </button>
              <button
                className={view === VIEW.COMPLETED ? 'btn-premium text-sm' : 'btn-secondary text-sm'}
                onClick={() => setView(VIEW.COMPLETED)}
              >
                Completed
              </button>
              <button
                className={view === VIEW.EXPIRED ? 'btn-premium text-sm' : 'btn-secondary text-sm'}
                onClick={() => setView(VIEW.EXPIRED)}
              >
                Expired
              </button>
              <button
                className={view === VIEW.ALL ? 'btn-premium text-sm' : 'btn-secondary text-sm'}
                onClick={() => setView(VIEW.ALL)}
              >
                All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto] gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-9"
                  placeholder="Search assignments…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <ListFilter className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <select className="input pl-9" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value={TYPE.ALL}>All types</option>
                  <option value={TYPE.MATERIAL}>Materials</option>
                  <option value={TYPE.MOCK_TEST}>Mock tests</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-elevated p-6 text-text-secondary">Loading assignments…</div>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <div className="card-elevated p-6 text-text-secondary">
            No assignments found.
          </div>
        ) : null}

        {!loading && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((a) => (
              <AssignmentCard key={a.id} a={a} />
            ))}
          </div>
        ) : null}

      </motion.div>
    </AppShell>
  );
}
