export const TASK_STATUSES = [
  {
    id: 'BACKLOG',
    label: 'Back Log',
    colStyle: 'border-slate-400 bg-slate-100 text-slate-700',
    badge: 'bg-slate-200 text-slate-800',
  },
  {
    id: 'PROCESSING',
    label: 'Processing',
    colStyle: 'border-blue-400 bg-blue-50/70 text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'PENDING',
    label: 'Pending',
    colStyle: 'border-amber-400 bg-amber-50/70 text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'REVIEWING',
    label: 'Reviewing',
    colStyle: 'border-indigo-400 bg-indigo-50/70 text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'DONE',
    label: 'Done',
    colStyle: 'border-emerald-400 bg-emerald-50/70 text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
  },
];

export const TASK_TYPES = [
  { id: 'DOC', label: 'Doc', fullLabel: 'Doc (Tài liệu)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'DRAW', label: 'Draw', fullLabel: 'Draw (Vẽ sơ đồ / UI)', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'ANALYST', label: 'Analyst', fullLabel: 'Analyst (Phân tích)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'CODE', label: 'Code', fullLabel: 'Code (Lập trình)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'TEST', label: 'Test', fullLabel: 'Test (Kiểm thử)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'SLIDE', label: 'Slide', fullLabel: 'Slide (Thuyết trình)', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'OTHER', label: 'Other', fullLabel: 'Other (Khác)', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const TEAM_ROLE_LABELS = {
  TEAM_LEADER: 'Team Leader',
  CO_LEADER: 'Co-Leader',
  MEMBER: 'Member',
};

export const getStatusMeta = (status) => {
  return TASK_STATUSES.find((s) => s.id === status) || TASK_STATUSES[0];
};

export const getTaskTypeMeta = (type) => {
  return TASK_TYPES.find((t) => t.id === type) || TASK_TYPES[TASK_TYPES.length - 1];
};

export const canUserCreateTask = (user) => {
  if (!user) return false;
  return (
    user.role === 'ADMIN' ||
    user.teamRole === 'TEAM_LEADER' ||
    user.teamRole === 'CO_LEADER' ||
    user.canCreateTask === true
  );
};

export const canUserSetStatus = (user, task, targetStatus) => {
  if (!user || !task) return false;
  const isAdmin = user.role === 'ADMIN';
  const isKeyRole = canUserCreateTask(user);
  const isAssigner = task.assigner?.id === user.id;
  const isAssignee = task.assignee?.id === user.id;

  if (targetStatus === 'REVIEWING') {
    return isKeyRole && (isAssigner || isAdmin);
  }
  if (targetStatus === 'DONE') {
    return isAssigner;
  }
  if (task.status === 'DONE' && targetStatus !== 'DONE') {
    return isAssigner || isAdmin;
  }
  if (targetStatus === 'PROCESSING' && !task.assignee) {
    return true;
  }
  return isAssignee || isAssigner || isAdmin;
};

export const getWarningInfo = (task) => {
  if (!task || !task.isOverdue || task.status === 'DONE') return null;
  if (task.warningLevel === 'YELLOW' || task.status === 'PENDING' || task.status === 'REVIEWING') {
    return {
      level: 'YELLOW',
      label: 'Trễ hạn (Chờ duyệt)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      cardRing: 'border-amber-400 ring-1 ring-amber-200 bg-amber-50/20',
      dateClass: 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200',
    };
  }
  return {
    level: 'RED',
    label: 'Quá hạn!',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-300',
    cardRing: 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/20',
    dateClass: 'text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200',
  };
};

export const formatDateVN = (dateString) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatShortDateVN = (dateString) => {
  if (!dateString) return '--';
  const [, month, day] = dateString.split('-');
  return `${day}/${month}`;
};
