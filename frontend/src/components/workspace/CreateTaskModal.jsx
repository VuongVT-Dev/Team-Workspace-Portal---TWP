import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../../api/workspaceApi';
import { authApi } from '../../api/authApi';
import { TASK_TYPES } from '../../utils/taskHelpers';
import LucianDropdown from '../lucian/LucianDropdown';
import {
  X,
  Plus,
  AlertCircle,
  Paperclip,
  Upload,
  FileText,
  PenTool,
  BarChart3,
  Code2,
  FlaskConical,
  Presentation,
  Sparkles,
  Layers,
  SignalLow,
  SignalMedium,
  SignalHigh,
  UserPlus,
  User,
} from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onCreated, phases }) => {
  const [taskCode, setTaskCode] = useState('');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('CODE');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [members, setMembers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (phases && phases.length > 0 && !phaseId) {
        setPhaseId(phases[0].id);
      }
      authApi
        .getMembers()
        .then((res) => {
          if (res?.data) setMembers(res.data);
        })
        .catch(console.error);
    }
  }, [isOpen, phases]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await workspaceApi.uploadTaskAttachment(formData);
      if (res?.data) {
        setAttachmentUrl(res.data.url);
        setAttachmentName(res.data.name);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải tệp đính kèm lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        taskCode: taskCode.trim() || null,
        title,
        taskType,
        difficulty,
        description,
        note,
        attachmentUrl: attachmentUrl.trim() || null,
        attachmentName: attachmentName.trim() || (attachmentUrl.trim() ? 'Tệp đính kèm' : null),
        phaseId: Number(phaseId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        startDate,
        endDate,
      };

      await workspaceApi.createTask(payload);
      onCreated();
      onClose();
      // Reset form
      setTaskCode('');
      setTitle('');
      setDescription('');
      setNote('');
      setAttachmentUrl('');
      setAttachmentName('');
      setAssigneeId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo task. Kiểm tra lại quyền hoặc thông tin nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tạo Task Mới</h3>
              <p className="text-[11px] text-slate-400">Task vừa tạo sẽ tự động vào trạng thái Back Log</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã Task (Tùy chọn)</label>
              <input
                type="text"
                value={taskCode}
                onChange={(e) => setTaskCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="Tự sinh: TWP-XXX"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Tên Task *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="VD: Thiết kế giao diện Admin Dashboard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại Task *</label>
              <LucianDropdown
                value={taskType}
                onChange={(val) => setTaskType(val)}
                fullWidth
                showDot
                ariaLabel="Chọn loại Task"
                options={TASK_TYPES.map((t, idx) => {
                  const icons = [<FileText />, <PenTool />, <BarChart3 />, <Code2 />, <FlaskConical />, <Presentation />, <Sparkles />];
                  return {
                    value: t.id,
                    label: t.label,
                    desc: t.fullLabel,
                    colorClass: ['u413-c3', 'u413-c1', 'u413-c2', 'u413-c1', 'u413-c4', 'u413-c2', 'u413-c0'][idx % 7],
                    icon: icons[idx % icons.length],
                  };
                })}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giai đoạn (Phase) *</label>
              <LucianDropdown
                value={String(phaseId)}
                onChange={(val) => setPhaseId(val)}
                fullWidth
                showDot
                placeholder="Chọn Phase..."
                ariaLabel="Chọn giai đoạn Phase"
                options={phases.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                  desc: `Phase ${p.displayOrder} · ${p.progressPercentage ?? 0}% DONE`,
                  colorClass: 'u413-c1',
                  icon: <Layers />,
                }))}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Độ khó</label>
              <LucianDropdown
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                fullWidth
                showDot
                ariaLabel="Chọn độ khó"
                options={[
                  { value: 'EASY', label: 'Dễ (EASY)', desc: 'Tác vụ nhanh, đơn giản', colorClass: 'u413-c4', icon: <SignalLow /> },
                  { value: 'MEDIUM', label: 'Trung bình (MEDIUM)', desc: 'Mức độ tiêu chuẩn', colorClass: 'u413-c3', icon: <SignalMedium /> },
                  { value: 'HARD', label: 'Khó (HARD)', desc: 'Nghiệp vụ phức tạp', colorClass: 'u413-c1', icon: <SignalHigh /> },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Người nhận Task <span className="text-slate-400 font-normal">(Trống = tự nhận)</span>
              </label>
              <LucianDropdown
                value={String(assigneeId)}
                onChange={(val) => setAssigneeId(val)}
                fullWidth
                showDot
                placeholder="Chưa chỉ định"
                ariaLabel="Chọn người nhận Task"
                options={[
                  {
                    value: '',
                    label: 'Chưa chỉ định (Mở)',
                    desc: 'Thành viên có thể bấm Nhận Task',
                    colorClass: 'u413-c0',
                    icon: <UserPlus />,
                  },
                  ...members.map((m) => ({
                    value: String(m.id),
                    label: m.fullName,
                    desc: `${m.studentCode} · @${m.username}`,
                    colorClass: 'u413-c2',
                    icon: <User />,
                  })),
                ]}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mô tả Task</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="Mô tả chi tiết yêu cầu công việc, tiêu chí hoàn thành..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tệp đính kèm (Upload hoặc Link)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  placeholder="Dán link hoặc tải tệp..."
                />
                <label className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? '...' : 'Tải lên'}</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              {attachmentName && (
                <p className="mt-1 text-[11px] text-indigo-600 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> {attachmentName}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lưu ý</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="Ghi chú quan trọng, ràng buộc kỹ thuật..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo Task (Back Log)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
