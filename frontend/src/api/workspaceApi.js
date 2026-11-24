import axiosClient from './axiosClient';

export const workspaceApi = {
  // Phases
  getPhases: () => {
    return axiosClient.get('/phases');
  },
  createPhase: (data) => {
    return axiosClient.post('/phases', data);
  },

  // Tasks
  getMyTasks: () => {
    return axiosClient.get('/tasks/my');
  },
  getAllTasks: (params = {}) => {
    return axiosClient.get('/tasks', { params });
  },
  createTask: (data) => {
    return axiosClient.post('/tasks', data);
  },
  uploadTaskAttachment: (formData) => {
    return axiosClient.post('/tasks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateTaskStatus: (taskId, status) => {
    return axiosClient.patch(`/tasks/${taskId}/status`, { status });
  },
  assignTask: (taskId, assigneeId) => {
    return axiosClient.patch(`/tasks/${taskId}/assign`, { assigneeId });
  },
  claimTask: (taskId) => {
    return axiosClient.post(`/tasks/${taskId}/claim`);
  },
  submitWork: (taskId, payload) => {
    const body = typeof payload === 'string' ? { workSubmissionNote: payload } : payload;
    return axiosClient.post(`/tasks/${taskId}/submit`, body);
  },
  startReview: (taskId) => {
    return axiosClient.post(`/tasks/${taskId}/start-review`);
  },
  reviewTask: (taskId, reviewComment, status) => {
    return axiosClient.post(`/tasks/${taskId}/review`, { reviewComment, status });
  },
  deleteTask: (taskId) => {
    return axiosClient.delete(`/tasks/${taskId}`);
  },
};
