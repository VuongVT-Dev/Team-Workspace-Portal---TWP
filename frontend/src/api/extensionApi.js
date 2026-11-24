import axiosClient from './axiosClient';

export const extensionApi = {
  getExtensions: (category) => {
    return axiosClient.get('/extensions', { params: { category } });
  },
  createExtension: (data) => {
    return axiosClient.post('/extensions', data);
  },
};
