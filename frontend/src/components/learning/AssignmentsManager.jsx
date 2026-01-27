import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const toIsoOrNull = (dtLocal) => {
  if (!dtLocal) return null;
  try {
    // datetime-local gives "YYYY-MM-DDTHH:mm" in local time.
    const d = new Date(dtLocal);
    return d.toISOString();
  } catch {
    return null;
  }
};

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    // yyyy-MM-ddTHH:mm
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export default function AssignmentsManager() {
  const [tab, setTab] = useState('assigned'); // assigned | assign | materials | groups

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // Assigned list
  const [assigned, setAssigned] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [assignedFilters, setAssignedFilters] = useState({
    q: '',
    type: '',
    status: '',
  });

  const [editing, setEditing] = useState(null); // assignment object
  const [editForm, setEditForm] = useState({
    start_at: '',
    end_at: '',
    sequence_order: 0,
    priority: 'OPTIONAL',
    unlock_override: false,
  });

  // Material form
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'PDF',
    url: '',
    file: null,
  });

  // Group form
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupMembers, setGroupMembers] = useState(new Set());

  // Assignment form
  const [targetMode, setTargetMode] = useState('group'); // group | students
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [assignmentForm, setAssignmentForm] = useState({
    assignment_type: 'MATERIAL',
    material: '',
    exam: '',
    start_at: '',
    end_at: '',
    sequence_order: 0,
    priority: 'OPTIONAL',
    unlock_override: false,
  });

  const filteredStudents = useMemo(() => {
    const term = (studentSearch || '').trim().toLowerCase();
    if (!term) return students;
    return (students || []).filter((s) => {
      const hay = `${s.username || ''} ${s.first_name || ''} ${s.last_name || ''} ${s.email || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [students, studentSearch]);

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await api.get('users/');
      const list = asList(res?.data);
      // teachers get only STUDENTs from backend; admin gets all → filter client-side
      setStudents(list.filter((u) => String(u.role || '').toUpperCase() === 'STUDENT'));
    } catch (e) {
      console.error('Failed to load students:', e);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const res = await api.get('student-groups/');
      setGroups(asList(res?.data));
    } catch (e) {
      console.error('Failed to load groups:', e);
      toast.error('Failed to load student groups');
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const res = await api.get('materials/');
      setMaterials(asList(res?.data));
    } catch (e) {
      console.error('Failed to load materials:', e);
      toast.error('Failed to load materials');
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      setExamsLoading(true);
      const res = await api.get('exams/');
      setExams(asList(res?.data));
    } catch (e) {
      console.error('Failed to load exams:', e);
      // Exams may be restricted in some roles; don't hard fail.
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const loadAssigned = async (opts = {}) => {
    const includeInactive = opts.includeInactive ?? showArchived;
    try {
      setAssignedLoading(true);
      const res = await api.get('assignments/', {
        params: {
          include_inactive: includeInactive ? 1 : 0,
        },
      });
      setAssigned(asList(res?.data));
    } catch (e) {
      console.error('Failed to load assignments:', e);
      toast.error('Failed to load assigned items');
      setAssigned([]);
    } finally {
      setAssignedLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadMaterials();
    loadExams();
    loadAssigned();
  }, []);

  useEffect(() => {
    loadAssigned({ includeInactive: showArchived });
  }, [showArchived]);

  // keep group members in sync when selecting a group
  useEffect(() => {
    const g = (groups || []).find((x) => String(x.id) === String(selectedGroupId));
    const ids = new Set((g?.student_ids || []).map((id) => Number(id)));
    setGroupMembers(ids);
  }, [groups, selectedGroupId]);

  const createMaterial = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', materialForm.title);
      fd.append('description', materialForm.description || '');
      fd.append('type', materialForm.type);
      if (materialForm.url) fd.append('url', materialForm.url);
      if (materialForm.file) fd.append('file', materialForm.file);

      toast.loading('Uploading material…', { id: 'mat' });
      await api.post('materials/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Material uploaded', { id: 'mat' });
      setMaterialForm({ title: '', description: '', type: 'PDF', url: '', file: null });
      await loadMaterials();
      setTab('assign');
    } catch (e2) {
      console.error('Failed to upload material:', e2);
      toast.error(e2?.response?.data?.detail || 'Failed to upload material', { id: 'mat' });
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Creating group…', { id: 'group' });
      const res = await api.post('student-groups/', groupForm);
      toast.success('Group created', { id: 'group' });
      setGroupForm({ name: '', description: '' });
      await loadGroups();
      const newId = res?.data?.id;
      if (newId) setSelectedGroupId(String(newId));
      setTab('groups');
    } catch (e2) {
      console.error('Failed to create group:', e2);
      toast.error(e2?.response?.data?.detail || 'Failed to create group', { id: 'group' });
    }
  };

  const saveGroupMembers = async () => {
    if (!selectedGroupId) {
      toast.error('Select a group first');
      return;
    }
    try {
      toast.loading('Saving members…', { id: 'members' });
      await api.put(`student-groups/${selectedGroupId}/`, {
        students: Array.from(groupMembers),
      });
      toast.success('Group updated', { id: 'members' });
      await loadGroups();
    } catch (e) {
      console.error('Failed to save group members:', e);
      toast.error(e?.response?.data?.detail || 'Failed to save members', { id: 'members' });
    }
  };

  const bulkAssign = async (e) => {
    e.preventDefault();

    const payload = {
      assignment_type: assignmentForm.assignment_type,
      material: assignmentForm.assignment_type === 'MATERIAL' ? Number(assignmentForm.material) : null,
      exam: assignmentForm.assignment_type === 'MOCK_TEST' ? Number(assignmentForm.exam) : null,
      start_at: toIsoOrNull(assignmentForm.start_at),
      end_at: toIsoOrNull(assignmentForm.end_at),
      sequence_order: Number(assignmentForm.sequence_order || 0),
      priority: assignmentForm.priority,
      unlock_override: Boolean(assignmentForm.unlock_override),
    };

    if (targetMode === 'group') {
      payload.group_id = selectedGroupId ? Number(selectedGroupId) : null;
    } else {
      payload.student_ids = Array.from(selectedStudentIds);
    }

    try {
      toast.loading('Assigning…', { id: 'assign' });
      await api.post('assignments/bulk/', payload);
      toast.success('Assigned successfully', { id: 'assign' });
      setAssignmentForm({
        assignment_type: 'MATERIAL',
        material: '',
        exam: '',
        start_at: '',
        end_at: '',
        sequence_order: 0,
        priority: 'OPTIONAL',
        unlock_override: false,
      });
      setSelectedStudentIds(new Set());
      await loadAssigned();
    } catch (e2) {
      console.error('Failed to assign:', e2);
      toast.error(e2?.response?.data?.detail || 'Failed to assign', { id: 'assign' });
    }
  };

  const openEdit = (a) => {
    setEditing(a);
    setEditForm({
      start_at: toLocalInputValue(a?.start_at),
      end_at: toLocalInputValue(a?.end_at),
      sequence_order: Number(a?.sequence_order || 0),
      priority: a?.priority || 'OPTIONAL',
      unlock_override: Boolean(a?.unlock_override),
    });
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    try {
      toast.loading('Saving…', { id: 'edit' });
      await api.patch(`assignments/${editing.id}/`, {
        start_at: toIsoOrNull(editForm.start_at),
        end_at: toIsoOrNull(editForm.end_at),
        sequence_order: Number(editForm.sequence_order || 0),
        priority: editForm.priority,
        unlock_override: Boolean(editForm.unlock_override),
      });
      toast.success('Updated', { id: 'edit' });
      setEditing(null);
      await loadAssigned();
    } catch (e) {
      console.error('Failed to update assignment:', e);
      toast.error(e?.response?.data?.detail || 'Failed to update', { id: 'edit' });
    }
  };

  const unlockAssignment = async (id) => {
    try {
      toast.loading('Unlocking…', { id: `unlock-${id}` });
      await api.patch(`assignments/${id}/unlock/`);
      toast.success('Unlocked', { id: `unlock-${id}` });
      await loadAssigned();
    } catch (e) {
      console.error('Failed to unlock:', e);
      toast.error('Failed to unlock', { id: `unlock-${id}` });
    }
  };

  const archiveAssignment = async (id) => {
    try {
      toast.loading('Archiving…', { id: `arch-${id}` });
      await api.patch(`assignments/${id}/archive/`);
      toast.success('Archived', { id: `arch-${id}` });
      await loadAssigned({ includeInactive: showArchived });
    } catch (e) {
      console.error('Failed to archive:', e);
      toast.error('Failed to archive', { id: `arch-${id}` });
    }
  };

  const restoreAssignment = async (id) => {
    try {
      toast.loading('Restoring…', { id: `res-${id}` });
      await api.patch(`assignments/${id}/restore/`);
      toast.success('Restored', { id: `res-${id}` });
      await loadAssigned({ includeInactive: showArchived });
    } catch (e) {
      console.error('Failed to restore:', e);
      toast.error('Failed to restore', { id: `res-${id}` });
    }
  };

  const filteredAssigned = useMemo(() => {
    const q = (assignedFilters.q || '').trim().toLowerCase();
    const type = assignedFilters.type;
    const status = assignedFilters.status;

    return (assigned || []).filter((a) => {
      if (type && a.assignment_type !== type) return false;
      if (status && a.status !== status) return false;

      if (!q) return true;
      const student = a?.assigned_to_info;
      const title = a?.assignment_type === 'MATERIAL' ? a?.material_info?.title : a?.exam_info?.title;
      const hay = `${student?.username || ''} ${student?.first_name || ''} ${student?.last_name || ''} ${title || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [assigned, assignedFilters.q, assignedFilters.type, assignedFilters.status]);

  return (
    <div className="space-y-6">
      <div className="card-elevated p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Assignments</h1>
            <p className="text-text-secondary mt-1">Upload materials, create groups, and assign tests/materials to students</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={tab === 'assigned' ? 'btn-premium text-sm' : 'btn-secondary text-sm'} onClick={() => setTab('assigned')}>Assigned</button>
            <button className={tab === 'assign' ? 'btn-premium text-sm' : 'btn-secondary text-sm'} onClick={() => setTab('assign')}>Assign</button>
            <button className={tab === 'materials' ? 'btn-premium text-sm' : 'btn-secondary text-sm'} onClick={() => setTab('materials')}>Materials</button>
            <button className={tab === 'groups' ? 'btn-premium text-sm' : 'btn-secondary text-sm'} onClick={() => setTab('groups')}>Groups</button>
          </div>
        </div>
      </div>

      {tab === 'assigned' ? (
        <div className="card p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Assigned Items</h2>
              <p className="text-sm text-text-secondary">Manage what you already assigned (edit windows, unlock, archive)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary text-sm" onClick={() => loadAssigned({ includeInactive: showArchived })} disabled={assignedLoading}>
                {assignedLoading ? 'Loading…' : 'Refresh'}
              </button>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
                Show archived
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
            <input
              className="input lg:col-span-2"
              placeholder="Search student or title…"
              value={assignedFilters.q}
              onChange={(e) => setAssignedFilters((p) => ({ ...p, q: e.target.value }))}
            />
            <select className="input" value={assignedFilters.type} onChange={(e) => setAssignedFilters((p) => ({ ...p, type: e.target.value }))}>
              <option value="">All types</option>
              <option value="MATERIAL">Material</option>
              <option value="MOCK_TEST">Mock test</option>
            </select>
            <select className="input" value={assignedFilters.status} onChange={(e) => setAssignedFilters((p) => ({ ...p, status: e.target.value }))}>
              <option value="">All status</option>
              <option value="PENDING">Pending</option>
              <option value="LOCKED">Locked</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {assignedLoading ? (
              <p className="text-sm text-text-secondary">Loading…</p>
            ) : null}

            {!assignedLoading && filteredAssigned.length === 0 ? (
              <p className="text-sm text-text-secondary">No assigned items found.</p>
            ) : null}

            {filteredAssigned.map((a) => {
              const student = a?.assigned_to_info;
              const title = a?.assignment_type === 'MATERIAL' ? a?.material_info?.title : a?.exam_info?.title;
              const badgeTone = a?.status === 'COMPLETED'
                ? 'bg-success/15 text-success border-success/30'
                : a?.status === 'EXPIRED'
                  ? 'bg-danger/15 text-danger border-danger/30'
                  : a?.status === 'LOCKED'
                    ? 'bg-warning/15 text-warning border-warning/30'
                    : 'bg-primary/15 text-primary border-primary/30';

              return (
                <div key={a.id} className="p-4 rounded-2xl border border-elevated/60 bg-surface/40">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${badgeTone}`}>{a.status}</span>
                        {!a.is_active ? <span className="text-xs px-2 py-1 rounded-full border bg-surface/60 text-text-secondary border-elevated/60">Archived</span> : null}
                        {a.unlock_override ? <span className="text-xs px-2 py-1 rounded-full border bg-primary/10 text-primary border-primary/30">Unlocked</span> : null}
                        <span className="text-xs text-text-secondary">{a.assignment_type}</span>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-text-secondary">{a.priority}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-text truncate">{title || '—'}</div>
                      <div className="mt-1 text-xs text-text-secondary truncate">
                        Student: {student?.first_name || ''} {student?.last_name || ''} <span className="text-text-secondary">@{student?.username}</span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        Window: {a.start_at ? new Date(a.start_at).toLocaleString() : 'Anytime'} → {a.end_at ? new Date(a.end_at).toLocaleString() : 'No deadline'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <button className="btn-secondary text-sm" onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn-secondary text-sm" onClick={() => unlockAssignment(a.id)} disabled={a.unlock_override}>Unlock</button>
                      {a.is_active ? (
                        <button className="btn-secondary text-sm" onClick={() => archiveAssignment(a.id)}>Archive</button>
                      ) : (
                        <button className="btn-secondary text-sm" onClick={() => restoreAssignment(a.id)}>Restore</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {editing ? (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
              <div className="relative w-full max-w-xl card-elevated p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-text">Edit Assignment</h3>
                    <p className="text-sm text-text-secondary">Update time window, sequence and priority</p>
                  </div>
                  <button className="btn-secondary text-sm" onClick={() => setEditing(null)}>Close</button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary">Start</label>
                    <input className="input" type="datetime-local" value={editForm.start_at} onChange={(e) => setEditForm((p) => ({ ...p, start_at: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary">End</label>
                    <input className="input" type="datetime-local" value={editForm.end_at} onChange={(e) => setEditForm((p) => ({ ...p, end_at: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary">Sequence order</label>
                    <input className="input" type="number" value={editForm.sequence_order} onChange={(e) => setEditForm((p) => ({ ...p, sequence_order: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary">Priority</label>
                    <select className="input" value={editForm.priority} onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))}>
                      <option value="OPTIONAL">Optional</option>
                      <option value="MANDATORY">Mandatory</option>
                    </select>
                  </div>
                </div>

                <label className="mt-3 flex items-center gap-3 text-sm text-text-secondary">
                  <input type="checkbox" checked={editForm.unlock_override} onChange={(e) => setEditForm((p) => ({ ...p, unlock_override: e.target.checked }))} />
                  Unlock override
                </label>

                <div className="mt-4 flex gap-2 justify-end">
                  <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                  <button className="btn-premium" onClick={saveEdit}>Save</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'materials' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-text mb-3">Upload / Add Material</h2>
            <form onSubmit={createMaterial} className="space-y-3">
              <input className="input" placeholder="Title" value={materialForm.title} onChange={(e) => setMaterialForm((p) => ({ ...p, title: e.target.value }))} required />
              <select className="input" value={materialForm.type} onChange={(e) => setMaterialForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="PDF">PDF</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
                <option value="NOTES">Notes</option>
                <option value="EXTERNAL_LINK">External Link</option>
              </select>
              <textarea className="input" rows={3} placeholder="Description (optional)" value={materialForm.description} onChange={(e) => setMaterialForm((p) => ({ ...p, description: e.target.value }))} />

              <input className="input" placeholder="External URL (optional)" value={materialForm.url} onChange={(e) => setMaterialForm((p) => ({ ...p, url: e.target.value }))} />

              <input
                className="input"
                type="file"
                onChange={(e) => setMaterialForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
              <button className="btn-premium w-full" type="submit">Save Material</button>
            </form>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text">Materials</h2>
              <button className="btn-secondary text-sm" onClick={loadMaterials} disabled={materialsLoading}>
                {materialsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {(materials || []).map((m) => (
                <div key={m.id} className="p-3 rounded-xl border border-elevated/60 bg-surface/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{m.title}</p>
                      <p className="text-xs text-text-secondary">{m.type}</p>
                    </div>
                    <a
                      className="text-xs text-primary hover:underline"
                      href={m.file_url || m.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
              {!materialsLoading && (materials || []).length === 0 ? (
                <p className="text-sm text-text-secondary">No materials yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'groups' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-text mb-3">Create Group</h2>
            <form onSubmit={createGroup} className="space-y-3">
              <input className="input" placeholder="Group name" value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} required />
              <textarea className="input" rows={3} placeholder="Description (optional)" value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} />
              <button className="btn-premium w-full" type="submit">Create Group</button>
            </form>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text">Manage Members</h2>
              <button className="btn-secondary text-sm" onClick={loadGroups} disabled={groupsLoading}>
                {groupsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            <select className="input" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
              <option value="">Select group…</option>
              {(groups || []).map((g) => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>

            <div className="mt-3">
              <input className="input" placeholder="Search students" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>

            <div className="mt-3 max-h-[40vh] overflow-y-auto space-y-2">
              {studentsLoading ? (
                <p className="text-sm text-text-secondary">Loading students…</p>
              ) : (
                filteredStudents.map((s) => {
                  const checked = groupMembers.has(Number(s.id));
                  return (
                    <label key={s.id} className="flex items-center gap-3 p-2 rounded-xl border border-elevated/60 bg-surface/40">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setGroupMembers((prev) => {
                            const next = new Set(prev);
                            const id = Number(s.id);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          });
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{s.first_name} {s.last_name} <span className="text-text-secondary">@{s.username}</span></p>
                        <p className="text-xs text-text-secondary truncate">{s.email}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <button className="btn-premium w-full mt-3" onClick={saveGroupMembers} disabled={!selectedGroupId}>
              Save Members
            </button>
          </div>
        </div>
      ) : null}

      {tab === 'assign' ? (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-text mb-3">Create Assignment</h2>

          <form onSubmit={bulkAssign} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm text-text-secondary">Assign to</label>
              <select className="input" value={targetMode} onChange={(e) => setTargetMode(e.target.value)}>
                <option value="group">Group</option>
                <option value="students">Selected students</option>
              </select>

              {targetMode === 'group' ? (
                <select className="input" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                  <option value="">Select group…</option>
                  {(groups || []).map((g) => (
                    <option key={g.id} value={String(g.id)}>{g.name}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input className="input" placeholder="Search students" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                  <div className="max-h-[40vh] overflow-y-auto space-y-2">
                    {(studentsLoading ? [] : filteredStudents).map((s) => {
                      const id = Number(s.id);
                      const checked = selectedStudentIds.has(id);
                      return (
                        <label key={s.id} className="flex items-center gap-3 p-2 rounded-xl border border-elevated/60 bg-surface/40">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedStudentIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(id)) next.delete(id);
                                else next.add(id);
                                return next;
                              });
                            }}
                          />
                          <span className="text-sm text-text">{s.first_name} {s.last_name} <span className="text-text-secondary">@{s.username}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm text-text-secondary">Assignment type</label>
              <select
                className="input"
                value={assignmentForm.assignment_type}
                onChange={(e) => setAssignmentForm((p) => ({ ...p, assignment_type: e.target.value }))}
              >
                <option value="MATERIAL">Material</option>
                <option value="MOCK_TEST">Mock test</option>
              </select>

              {assignmentForm.assignment_type === 'MATERIAL' ? (
                <select
                  className="input"
                  value={assignmentForm.material}
                  onChange={(e) => setAssignmentForm((p) => ({ ...p, material: e.target.value }))}
                  required
                >
                  <option value="">Select material…</option>
                  {(materials || []).map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.title}</option>
                  ))}
                </select>
              ) : (
                <select
                  className="input"
                  value={assignmentForm.exam}
                  onChange={(e) => setAssignmentForm((p) => ({ ...p, exam: e.target.value }))}
                  required
                >
                  <option value="">Select exam…</option>
                  {(exams || []).map((x) => (
                    <option key={x.id} value={String(x.id)}>{x.title}</option>
                  ))}
                </select>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-secondary">Start</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={assignmentForm.start_at}
                    onChange={(e) => setAssignmentForm((p) => ({ ...p, start_at: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary">End</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={assignmentForm.end_at}
                    onChange={(e) => setAssignmentForm((p) => ({ ...p, end_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-secondary">Sequence order</label>
                  <input
                    className="input"
                    type="number"
                    value={assignmentForm.sequence_order}
                    onChange={(e) => setAssignmentForm((p) => ({ ...p, sequence_order: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary">Priority</label>
                  <select className="input" value={assignmentForm.priority} onChange={(e) => setAssignmentForm((p) => ({ ...p, priority: e.target.value }))}>
                    <option value="OPTIONAL">Optional</option>
                    <option value="MANDATORY">Mandatory</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-text-secondary">
                <input type="checkbox" checked={assignmentForm.unlock_override} onChange={(e) => setAssignmentForm((p) => ({ ...p, unlock_override: e.target.checked }))} />
                Unlock manually (override)
              </label>

              <button className="btn-premium w-full" type="submit">
                Assign
              </button>

              <div className="text-xs text-text-secondary">
                {examsLoading ? 'Loading exams…' : null}
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
