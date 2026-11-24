import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import {
  getTaskTypeMeta,
  getWarningInfo,
  formatDateVN,
} from '../../utils/taskHelpers';
import { Calendar, AlertTriangle, Paperclip, Play, Send } from 'lucide-react';
import { TableRowsSkeleton } from '../lucian/SkeletonPrimitives';
import StatusDropdown from '../lucian/StatusDropdown';

const MyTasksTab = ({ tasks, loading = false, onRefresh, onSelectTask }) => {
  const { user: currentUser } = useAuth();

  const handleStatusChange = async (taskId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await workspaceApi.updateTaskStatus(taskId, newStatus);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  if (!loading && (!tasks || tasks.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Chưa có công việc nào được giao cho bạn</h4>
        <p className="text-xs text-slate-400 mt-1">
          Hãy chuyển sang tab "Bảng công việc & Nhận Task" để bấm nút "Nhận Task" cho các công việc đang mở.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Note: Đừng lười biếng
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Danh Sách Công Việc Của Tôi</h3>
          <p className="text-xs text-slate-400">
            Nhấn vào từng dòng để xem mô tả chi tiết, tệp đính kèm và lưu ý
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
          {tasks.length} công việc
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
              <th className="py-3 px-4 w-24">Mã Task</th>
              <th className="py-3 px-4 min-w-[220px]">Tên Task & Mô tả</th>
              <th className="py-3 px-3">Loại</th>
              <th className="py-3 px-3">Người tạo</th>
              <th className="py-3 px-3">Start – End Date</th>
              <th className="py-3 px-3">Cảnh báo</th>
              <th className="py-3 px-4 w-48">Trạng thái & Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableRowsSkeleton columns={7} rows={4} />
            ) : (
              tasks.map((task, idx) => {
                const typeMeta = getTaskTypeMeta(task.taskType);
                const warn = getWarningInfo(task);

                return (
                  <tr
                    key={task.id}
                    style={{ '--d': `${idx * 0.05}s` }}
                    onClick={() => onSelectTask && onSelectTask(task)}
                    className="u439-enter hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {task.taskCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{task.title}</span>
                        {task.attachmentUrl && (
                          <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" title="Có tệp đính kèm" />
                        )}
                      </div>
                      {task.phaseName && (
                        <span className="block text-[10px] text-indigo-500 font-medium mt-0.5">
                          {task.phaseName}
                        </span>
                      )}
                      {task.description && (
                        <span className="block text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {task.assigner?.fullName || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <div className="text-[11px] text-slate-500">{formatDateVN(task.startDate)}</div>
                      <div className={warn ? warn.dateClass : 'text-[11px] text-slate-700 font-semibold'}>
                        → {formatDateVN(task.endDate)}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {warn ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${warn.badgeClass}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {warn.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Đúng tiến độ</span>
                      )}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <StatusDropdown
                          task={task}
                          currentUser={currentUser}
                          compact
                          onChangeStatus={(newStatus) => handleStatusChange(task.id, newStatus)}
                        />

                        {/* Quick workflow transition buttons */}
                        {task.status === 'BACKLOG' && (
                          <button
                            onClick={(e) => handleStatusChange(task.id, 'PROCESSING', e)}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shrink-0"
                            title="Bắt đầu làm (Chuyển sang Processing)"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {task.status === 'PROCESSING' && (
                          <button
                            onClick={(e) => handleStatusChange(task.id, 'PENDING', e)}
                            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition shrink-0"
                            title="Hoàn thành task (Chuyển sang Pending chờ Review)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTasksTab;
