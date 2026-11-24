import axiosClient from './axiosClient';

export const authApi = {
  login: (username, password) => {
    return axiosClient.post('/auth/login', { username, password });
  },
  getMe: () => {
    return axiosClient.get('/auth/me');
  },
  getProfile: () => {
    return axiosClient.get('/profile/me');
  },
  updateProfile: (data) => {
    return axiosClient.put('/profile/me', data);
  },
  getMembers: () => {
    return axiosClient.get('/profile/members');
  },
  uploadAvatar: (formData) => {
    return axiosClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};
