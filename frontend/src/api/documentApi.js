import axiosClient from './axiosClient';

export const documentApi = {
  getDocuments: () => {
    return axiosClient.get('/documents');
  },
  uploadDocument: (formData) => {
    return axiosClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
