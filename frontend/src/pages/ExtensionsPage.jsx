import React, { useState, useEffect } from 'react';
import { extensionApi } from '../api/extensionApi';
import {
  Puzzle,
  Terminal,
  Code,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Database,
  Plus
} from 'lucide-react';

const ExtensionsPage = () => {
  const [extensions, setExtensions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { code: 'ALL', label: 'Tất cả tiêu chuẩn' },
    { code: 'IDE', label: 'IDE & Công cụ' },
    { code: 'LANGUAGE', label: 'Ngôn ngữ & Runtime' },
    { code: 'PLUGIN', label: 'Extensions / Plugins' },
    { code: 'ENV_CONFIG', label: 'Cấu hình mẫu & Snippet' },
  ];

  const fetchExtensions = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory === 'ALL' ? '' : selectedCategory;
      const res = await extensionApi.getExtensions(categoryParam);
      if (res?.data) {
        setExtensions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions();
  }, [selectedCategory]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Tiêu Chuẩn Kỹ Thuật & Mở Rộng Dự Án
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy chuẩn thống nhất về IDE, phiên bản ngôn ngữ lập trình, tiện ích mở rộng và lệnh cấu hình chuẩn cho toàn đội.
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Note: Một số quy chuẩn có thể không cần thiết hoặc được thiết lập tùy theo IDE, nhiệm vụ và môi trường, không bắt buộc setup 100%!
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCategory(c.code)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${selectedCategory === c.code
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Extension Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Đang tải danh sách tiêu chuẩn...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {ext.category}
                  </span>
                  {ext.version && (
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      v{ext.version}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-sm">{ext.itemName}</h4>
                {ext.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{ext.description}</p>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Config Snippet with Copy Button */}
                {ext.configSnippet && (
                  <div className="relative bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Lệnh / Cấu hình mẫu</span>
                      <button
                        onClick={() => handleCopy(ext.id, ext.configSnippet)}
                        className="flex items-center gap-1 text-slate-300 hover:text-white transition"
                        title="Copy cấu hình"
                      >
                        {copiedId === ext.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-sans">Đã copy</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="font-sans">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap">{ext.configSnippet}</pre>
                  </div>
                )}

                {/* Reference Link */}
                {ext.referenceUrl && (
                  <a
                    href={ext.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>Tài liệu tham chiếu chính thức</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtensionsPage;
