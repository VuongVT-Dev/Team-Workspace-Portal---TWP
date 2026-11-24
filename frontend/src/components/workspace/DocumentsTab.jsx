import React, { useState } from 'react';
import { documentApi } from '../../api/documentApi';
import { Upload, FileText, Download, Folder, Plus, Check, X, Network, Presentation, BookOpen, FileArchive } from 'lucide-react';
import { TableRowsSkeleton } from '../lucian/SkeletonPrimitives';
import LucianDropdown from '../lucian/LucianDropdown';

const DocumentsTab = ({ documents, loading = false, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Báo cáo & Tài liệu SRS');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn một file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);

    try {
      await documentApi.uploadDocument(formData);
      onRefresh();
      setShowUploadModal(false);
      setFile(null);
      setTitle('');
      alert('Tải lên tài liệu thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải file lên');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (kb) => {
    if (!kb) return '0 KB';
    if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
    return kb + ' KB';
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Kho Tài Liệu Đồ Án Nhóm</h3>
          <p className="text-xs text-slate-400">Lưu trữ tập trung các file báo cáo, sơ đồ kiến trúc, slide thuyết trình</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Upload className="w-4 h-4" />
          <span>+ Tải Lên Tài Liệu</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-sm">Tải Lên Tài Liệu Mới</h4>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg" aria-label="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên tài liệu hiển thị</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bản đặc tả SRS v2.0 (Final)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân loại tài liệu</label>
                <LucianDropdown
                  value={category}
                  onChange={(val) => setCategory(val)}
                  fullWidth
                  showDot
                  ariaLabel="Chọn phân loại tài liệu"
                  options={[
                    { value: 'Báo cáo & Tài liệu SRS', label: 'Báo cáo & Tài liệu SRS', desc: 'Đặc tả yêu cầu & báo cáo đồ án', colorClass: 'u413-c1', icon: <FileText /> },
                    { value: 'Sơ đồ thiết kế CSDL / Kiến trúc', label: 'Sơ đồ CSDL / Kiến trúc', desc: 'ERD, Use Case, System Design', colorClass: 'u413-c2', icon: <Network /> },
                    { value: 'Slide thuyết trình', label: 'Slide thuyết trình', desc: 'Bài trình bày bảo vệ đồ án', colorClass: 'u413-c3', icon: <Presentation /> },
                    { value: 'Tài liệu tham khảo / Research', label: 'Tài liệu tham khảo', desc: 'Nghiên cứu, bài báo, hướng dẫn', colorClass: 'u413-c4', icon: <BookOpen /> },
                    { value: 'Source Code / Archive ZIP', label: 'Source Code / Archive ZIP', desc: 'Tệp nén mã nguồn & tài nguyên', colorClass: 'u413-c0', icon: <FileArchive /> },
                  ]}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn tập tin từ máy tính *</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {uploading ? 'Đang tải lên...' : 'Bắt đầu Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
                <th className="py-3 px-4">Tên tài liệu</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Loại file</th>
                <th className="py-3 px-4">Dung lượng</th>
                <th className="py-3 px-4">Người đăng</th>
                <th className="py-3 px-4">Ngày đăng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableRowsSkeleton columns={7} rows={4} />
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                    Chưa có tài liệu nào được tải lên trong kho.
                  </td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    style={{ '--d': `${idx * 0.05}s` }}
                    className="u439-enter hover:bg-slate-50/70 transition"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase">
                      {doc.fileType || 'FILE'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {formatFileSize(doc.fileSizeKb)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {doc.uploadedBy?.fullName || 'Ẩn danh'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về / Xem</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
