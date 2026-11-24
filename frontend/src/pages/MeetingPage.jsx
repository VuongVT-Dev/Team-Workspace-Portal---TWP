import React, { useState, useEffect } from 'react';
import { meetingApi } from '../api/meetingApi';
import { authApi } from '../api/authApi';
import LucianDropdown from '../components/lucian/LucianDropdown';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  ExternalLink,
  Plus,
  Clock,
  FileText,
  Users,
  CheckCircle,
  CheckCircle2,
  Save,
  Calendar,
  X,
  XCircle,
  User
} from 'lucide-react';

const MeetingPage = () => {
  const { user: currentUser } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeNoteContent, setActiveNoteContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for new meeting
  const [title, setTitle] = useState('');
  const [googleMeetLink, setGoogleMeetLink] = useState('https://meet.google.com/abc-xyz-wsp');
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Logtime state
  const [logUserId, setLogUserId] = useState('');
  const [logStatus, setLogStatus] = useState('PRESENT');
  const [logMinutes, setLogMinutes] = useState(60);
  const [logNote, setLogNote] = useState('');

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const [meetRes, memberRes] = await Promise.all([
        meetingApi.getMeetings(),
        authApi.getMembers(),
      ]);

      if (meetRes?.data) {
        setMeetings(meetRes.data);
        if (meetRes.data.length > 0 && !selectedMeeting) {
          setSelectedMeeting(meetRes.data[0]);
          setActiveNoteContent(meetRes.data[0].takeNoteContent || '');
        }
      }
      if (memberRes?.data) setMembers(memberRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSelectMeeting = (m) => {
    setSelectedMeeting(m);
    setActiveNoteContent(m.takeNoteContent || '');
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await meetingApi.createMeeting({
        title,
        googleMeetLink,
        startTime,
        durationMinutes: Number(durationMinutes),
        takeNoteContent: '### Biên bản cuộc họp:\n- Nội dung thảo luận:\n- Quyết định:\n- Việc cần làm tiếp theo (TODO):',
      });
      fetchMeetings();
      setShowCreateModal(false);
      setTitle('');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo cuộc họp');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMeeting) return;
    try {
      await meetingApi.updateNotes(selectedMeeting.id, {
        takeNoteContent: activeNoteContent,
      });
      alert('Đã lưu biên bản cuộc họp thành công!');
      fetchMeetings();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu ghi chú');
    }
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    if (!selectedMeeting || !logUserId) return;

    try {
      await meetingApi.logAttendance(selectedMeeting.id, {
        userId: Number(logUserId),
        attendanceStatus: logStatus,
        loggedMinutes: Number(logMinutes),
        contributionNote: logNote,
      });
      alert('Đã cập nhật logtime họp thành công!');
      fetchMeetings();
      setLogNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi điểm danh');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Quick Meet Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Phòng Họp Của Nhóm</h3>
            <p className="text-xs text-indigo-100 font-mono mt-0.5 truncate max-w-md">
              {googleMeetLink}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={googleMeetLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-xs shadow-lg transition"
          >
            <span>Vào phòng họp ngay</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-white/20 text-white font-semibold rounded-xl text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo buổi họp</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Meeting list (Left) + Detail/Notes/Logtime (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Meeting List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Danh Sách Buổi Họp ({meetings.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {meetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMeeting(m)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <div className="font-bold text-slate-800 line-clamp-1">{m.title}</div>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(m.startTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px]">
                    <span className="text-slate-500">Thời lượng: {m.durationMinutes}p</span>
                    <span className="font-semibold text-indigo-600">
                      Tổng logtime: {m.totalLoggedMinutes || 0}p
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Meeting Notes & Attendance Logtime */}
        {selectedMeeting ? (
          <div className="lg:col-span-2 space-y-6">

            {/* Note Editor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    Biên Bản Cuộc Họp (Take-note Markdown)
                  </h4>
                </div>
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu ghi chú</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={activeNoteContent}
                onChange={(e) => setActiveNoteContent(e.target.value)}
                placeholder="Ghi nhận nội dung thảo luận, phân công việc tiếp theo..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Attendance & Logtime */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    Điểm Danh & Ghi Nhận Logtime Tham Dự
                  </h4>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Tổng thời gian: {selectedMeeting.totalLoggedMinutes || 0} phút
                </span>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">Thành viên</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Số phút họp</th>
                      <th className="py-2.5 px-3">Ghi chú đóng góp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMeeting.logs && selectedMeeting.logs.length > 0 ? (
                      selectedMeeting.logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <img
                              src={log.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.user?.username}`}
                              alt={log.user?.fullName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{log.user?.fullName}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.attendanceStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                                log.attendanceStatus === 'LATE' ? 'bg-amber-100 text-amber-800' :
                                  'bg-rose-100 text-rose-800'
                              }`}>
                              {log.attendanceStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                            {log.loggedMinutes} phút
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {log.contributionNote || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-slate-400 italic">
                          Chưa có thành viên nào được ghi nhận logtime.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form Ghi Logtime Nhanh */}
              <form onSubmit={handleLogAttendance} className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <LucianDropdown
                    value={String(logUserId)}
                    onChange={(val) => setLogUserId(val)}
                    fullWidth
                    compact
                    showDot
                    placeholder="-- Chọn thành viên --"
                    ariaLabel="Chọn thành viên điểm danh"
                    options={members.map((m) => ({
                      value: String(m.id),
                      label: m.fullName,
                      desc: m.studentCode,
                      colorClass: 'u413-c2',
                      icon: <User />,
                    }))}
                  />
                </div>

                <div>
                  <LucianDropdown
                    value={logStatus}
                    onChange={(val) => setLogStatus(val)}
                    fullWidth
                    compact
                    showDot
                    ariaLabel="Chọn trạng thái điểm danh"
                    options={[
                      { value: 'PRESENT', label: 'Có mặt (PRESENT)', desc: 'Tham gia đầy đủ', colorClass: 'u413-c4', icon: <CheckCircle2 /> },
                      { value: 'LATE', label: 'Vào trễ (LATE)', desc: 'Tham gia muộn', colorClass: 'u413-c3', icon: <Clock /> },
                      { value: 'ABSENT', label: 'Vắng (ABSENT)', desc: 'Không tham gia', colorClass: 'u413-c0', icon: <XCircle /> },
                    ]}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(e.target.value)}
                    placeholder="Số phút"
                    min="0"
                    required
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Ghi chú đóng góp"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0"
                  >
                    Ghi
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : null}
      </div>

      {/* Modal Tạo Buổi Họp Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-sm">Lên Lịch Buổi Họp Mới</h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg" aria-label="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề buổi họp *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="VD: Họp Sprint Review Giai Đoạn 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đường dẫn Google Meet *</label>
                <input
                  type="text"
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    min="15"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                >
                  Tạo Buổi Họp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPage;
