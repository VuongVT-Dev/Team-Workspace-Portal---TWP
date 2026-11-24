import React, { useState, useEffect } from 'react';
import { scheduleApi } from '../api/scheduleApi';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  Filter,
  Clock,
  BookOpen,
  Coffee
} from 'lucide-react';

const ScheduleLeavePage = () => {
  const { user: currentUser } = useAuth();
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('ALL');
  const [modalSlot, setModalSlot] = useState(null);
  const [slotType, setSlotType] = useState('CLASS');
  const [subjectOrReason, setSubjectOrReason] = useState('');

  const days = [
    { code: 'MON', label: 'Thứ 2' },
    { code: 'TUE', label: 'Thứ 3' },
    { code: 'WED', label: 'Thứ 4' },
    { code: 'THU', label: 'Thứ 5' },
    { code: 'FRI', label: 'Thứ 6' },
    { code: 'SAT', label: 'Thứ 7' },
    { code: 'SUN', label: 'Chủ Nhật' },
  ];

  const shifts = [
    { code: 'MORNING_1', label: 'Slot 1', time: '7h - 9h15m' },
    { code: 'MORNING_2', label: 'Slot 2', time: '9h30m - 11h45m' },
    { code: 'AFTERNOON_1', label: 'Slot 3', time: '13h - 15h15m' },
    { code: 'AFTERNOON_2', label: 'Slot 4', time: '15h30m - 17h45m' },
    { code: 'EVENING', label: 'EX Slot', time: 'After 6h' },
  ];

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.getSchedules();
      if (res?.data) {
        setGrid(res.data);
      }
    } catch (err) {
      console.error('Failed to load schedule', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleCellClick = (dayCode, shiftCode, myEntry) => {
    if (myEntry) {
      // Đã có lịch -> hỏi hủy bỏ (Toggle off)
      if (window.confirm('Bạn muốn xóa lịch bận tại khung giờ này?')) {
        toggleSchedule(dayCode, shiftCode, myEntry.type, '');
      }
    } else {
      // Chưa có lịch -> mở modal chọn loại lịch
      setModalSlot({ dayCode, shiftCode });
      setSlotType('CLASS');
      setSubjectOrReason('');
    }
  };

  const toggleSchedule = async (dayCode, shiftCode, type, reason) => {
    try {
      await scheduleApi.toggleSchedule({
        dayOfWeek: dayCode,
        shift: shiftCode,
        type: type,
        subjectOrReason: reason,
      });
      fetchSchedule();
      setModalSlot(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật lịch');
    }
  };

  const getSlot = (dayCode, shiftCode) => {
    return grid.find((g) => g.dayOfWeek === dayCode && g.shift === shiftCode) || {
      busyMembers: [],
      isAllFree: true,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            TimeTable
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn giờ học của bạn trong tuần! Thời khóa biểu này có thể giúp bạn và cả nhóm theo dõi thời gian học tập và làm việc của bạn!
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Timeline này được dựa trên lịch học ở trường, nếu bận ngoài giờ, hãy cứ tick vào ô tương ứng.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowFreeOnly(!showFreeOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${showFreeOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chỉ xem ca cả Team cùng rảnh</span>
          </button>
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-600">Note:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></span>
          <span className="text-slate-600">Lịch học</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400"></span>
          <span className="text-slate-600">Nghỉ phép</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500"></span>
          <span className="text-emerald-700 font-semibold">Team có thể họp đông đủ</span>
        </div>
      </div>

      {/* 7 x 5 Weekly Interactive Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700 font-semibold">
                <th className="py-3 px-3 w-32 text-left">Slot</th>
                {days.map((d) => (
                  <th key={d.code} className="py-3 px-2 border-l border-slate-200">
                    <span className="block font-bold">{d.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal font-mono">{d.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {shifts.map((shift) => (
                <tr key={shift.code} className="divide-x divide-slate-200">
                  {/* Shift Label Column */}
                  <td className="p-3 bg-slate-50/70 text-left text-xs font-semibold text-slate-800">
                    <div>{shift.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{shift.time}</span>
                    </div>
                  </td>

                  {/* 7 Days Columns */}
                  {days.map((day) => {
                    const slot = getSlot(day.code, shift.code);
                    const isAllFree = slot.busyMembers.length === 0;
                    const myEntry = slot.busyMembers.find((m) => m.userId === currentUser?.id);

                    if (showFreeOnly && !isAllFree) {
                      return (
                        <td key={day.code} className="p-2 bg-slate-50/40 opacity-40 select-none">
                          <span className="text-[10px] text-slate-400">Có người bận</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day.code}
                        onClick={() => handleCellClick(day.code, shift.code, myEntry)}
                        className={`p-2 transition cursor-pointer relative group ${isAllFree
                          ? 'bg-emerald-50/60 hover:bg-emerald-100/70'
                          : 'bg-white hover:bg-slate-50'
                          }`}
                      >
                        {isAllFree ? (
                          <div className="py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>100% Rảnh</span>
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-left">
                            {slot.busyMembers.map((m) => (
                              <div
                                key={m.userId}
                                className={`flex items-center gap-1.5 p-1 rounded-md text-[10px] font-medium border ${m.type === 'CLASS'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                title={`${m.fullName}: ${m.subjectOrReason || (m.type === 'CLASS' ? 'Lịch học' : 'Nghỉ phép')}`}
                              >
                                <img
                                  src={m.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.userId}`}
                                  alt={m.fullName}
                                  className="w-4 h-4 rounded-full bg-white shrink-0"
                                />
                                <span className="truncate">{m.fullName}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Hover hint */}
                        <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition pointer-events-none rounded flex items-center justify-center">
                          <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow">
                            {myEntry ? 'Bấm để xóa' : '+ Đăng ký'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Đăng Ký Khung Giờ */}
      {
        modalSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                Đăng Ký Khung Giờ Bận ({modalSlot.dayCode} - {modalSlot.shiftCode})
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại lịch</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSlotType('CLASS')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${slotType === 'CLASS'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                        }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Lịch học (CLASS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotType('LEAVE')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${slotType === 'LEAVE'
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600'
                        }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Nghỉ phép (LEAVE)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học hoặc lý do (Tùy chọn)</label>
                  <input
                    type="text"
                    value={subjectOrReason}
                    onChange={(e) => setSubjectOrReason(e.target.value)}
                    placeholder="VD: Học Kỹ thuật Phần mềm..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalSlot(null)}
                    className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSchedule(modalSlot.dayCode, modalSlot.shiftCode, slotType, subjectOrReason)}
                    className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                  >
                    Lưu Lịch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ScheduleLeavePage;
