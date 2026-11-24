import axiosClient from './axiosClient';

export const meetingApi = {
  getMeetings: () => {
    return axiosClient.get('/meetings');
  },
  createMeeting: (data) => {
    return axiosClient.post('/meetings', data);
  },
  updateNotes: (meetingId, data) => {
    return axiosClient.patch(`/meetings/${meetingId}/notes`, data);
  },
  logAttendance: (meetingId, data) => {
    return axiosClient.post(`/meetings/${meetingId}/attendance`, data);
  },
};
