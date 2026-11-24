// Lucian UX/UI Prompt #413 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#413
import React from 'react';
import { Inbox, Zap, Clock, Eye, CheckCircle2 } from 'lucide-react';
import { canUserSetStatus } from '../../utils/taskHelpers';
import LucianDropdown from './LucianDropdown';

const STATUS_OPTIONS = [
  {
    value: 'BACKLOG',
    label: 'Back Log',
    desc: 'Chờ nhận hoặc bắt đầu',
    colorClass: 'u413-c0',
    icon: <Inbox />,
  },
  {
    value: 'PROCESSING',
    label: 'Processing',
    desc: 'Đang thực hiện công việc',
    colorClass: 'u413-c2',
    icon: <Zap />,
  },
  {
    value: 'PENDING',
    label: 'Pending',
    desc: 'Hoàn thành, chờ vào review',
    colorClass: 'u413-c3',
    icon: <Clock />,
  },
  {
    value: 'REVIEWING',
    label: 'Reviewing',
    desc: 'Role chủ chốt đang kiểm tra',
    colorClass: 'u413-c1',
    icon: <Eye />,
  },
  {
    value: 'DONE',
    label: 'Done',
    desc: 'Đạt chuẩn & nhảy % Phase',
    colorClass: 'u413-c4',
    icon: <CheckCircle2 />,
  },
];

export function StatusDropdown({
  task,
  currentUser,
  onChangeStatus,
  disabled = false,
  compact = false,
}) {
  const options = STATUS_OPTIONS.map((opt) => {
    const allowed = canUserSetStatus(currentUser, task, opt.value);
    return {
      ...opt,
      disabled: !allowed,
      desc: allowed ? opt.desc : 'Không đủ quyền chuyển',
    };
  });

  return (
    <LucianDropdown
      options={options}
      value={task?.status}
      disabled={disabled}
      compact={compact}
      hoverOpen
      showDot
      ariaLabel={`Đổi trạng thái (hiện tại: ${task?.status || 'BACKLOG'})`}
      onChange={(nextStatus) => {
        if (nextStatus !== task?.status && onChangeStatus) {
          onChangeStatus(nextStatus);
        }
      }}
    />
  );
}

export default StatusDropdown;
