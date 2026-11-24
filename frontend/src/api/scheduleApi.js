import axiosClient from './axiosClient';

export const scheduleApi = {
  getSchedules: () => {
    return axiosClient.get('/schedules');
  },
  toggleSchedule: (data) => {
    return axiosClient.post('/schedules/toggle', data);
  },
};
