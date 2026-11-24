import React, { useState, useEffect } from 'react';
import { workspaceApi } from '../api/workspaceApi';
import MyTasksTab from '../components/workspace/MyTasksTab';
import BoardAssignTab from '../components/workspace/BoardAssignTab';
import ProgressReviewTab from '../components/workspace/ProgressReviewTab';
import DocumentsTab from '../components/workspace/DocumentsTab';
import CreateTaskModal from '../components/workspace/CreateTaskModal';
import CreatePhaseModal from '../components/workspace/CreatePhaseModal';
import TaskDetailModal from '../components/workspace/TaskDetailModal';
import {
  CheckSquare,
  Kanban,
  TrendingUp,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';

const WorkspacePage = () => {
  const [activeTab, setActiveTab] = useState(2);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const start = Date.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDelay = reducedMotion ? 0 : 380;

    try {
      const [phasesRes, tasksRes, myTasksRes, docsRes] = await Promise.all([
        workspaceApi.getPhases(),
        workspaceApi.getAllTasks(),
        workspaceApi.getMyTasks(),
        import('../api/documentApi').then((m) => m.documentApi.getDocuments()),
      ]);

      const elapsed = Date.now() - start;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }

      if (phasesRes?.data) setPhases(phasesRes.data);
      if (tasksRes?.data) setTasks(tasksRes.data);
      if (myTasksRes?.data) setMyTasks(myTasksRes.data);
      if (docsRes?.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error('Error fetching workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 1, label: 'Công việc của tôi', icon: CheckSquare, count: myTasks.length },
    { id: 2, label: 'Bảng công việc & Nhận Task', icon: Kanban, count: tasks.length },
    { id: 3, label: 'Tiến độ Phase & Review', icon: TrendingUp },
    { id: 4, label: 'Kho tài liệu', icon: FolderArchive, count: documents.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Work Space
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý công việc của bạn - của Team
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 4 Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${isActive
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents (Stay mounted so each tab shows Lucian #439 card/row skeletons in place) */}
      <div>
        {activeTab === 1 && (
          <MyTasksTab
            tasks={myTasks}
            loading={loading}
            onRefresh={fetchData}
            onSelectTask={setSelectedTask}
          />
        )}

        {activeTab === 2 && (
          <BoardAssignTab
            tasks={tasks}
            phases={phases}
            loading={loading}
            onRefresh={fetchData}
            onOpenCreateModal={() => setIsTaskModalOpen(true)}
            onSelectTask={setSelectedTask}
          />
        )}

        {activeTab === 3 && (
          <ProgressReviewTab
            phases={phases}
            tasks={tasks}
            loading={loading}
            onRefresh={fetchData}
            onOpenCreatePhaseModal={() => setIsPhaseModalOpen(true)}
            onSelectTask={setSelectedTask}
          />
        )}

        {activeTab === 4 && (
          <DocumentsTab
            documents={documents}
            loading={loading}
            onRefresh={fetchData}
          />
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={fetchData}
        phases={phases}
      />

      <CreatePhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onCreated={fetchData}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onRefresh={() => {
          fetchData();
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default WorkspacePage;
