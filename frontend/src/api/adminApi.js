import axiosClient from './axiosClient';

export const adminApi = {
  getDashboard: () => {
    return axiosClient.get('/admin/dashboard');
  },
  getMembers: () => {
    return axiosClient.get('/admin/members');
  },
  createMember: (data) => {
    return axiosClient.post('/admin/members', data);
  },
  updateMemberRole: (userId, data) => {
    return axiosClient.patch(`/admin/members/${userId}/role`, data);
  },
  deleteMember: (userId) => {
    return axiosClient.delete(`/admin/members/${userId}`);
  },
};
