import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { updateLoadingState } from '../context/LoadingContext';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  updateLoadingState(1);
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  updateLoadingState(-1);
  return Promise.reject(error);
});

api.interceptors.response.use((response: AxiosResponse) => {
  updateLoadingState(-1);
  return response;
}, (error) => {
  updateLoadingState(-1);
  return Promise.reject(error);
});

export const authService = {
  loginWithGoogle: (idToken: string, role?: string) => api.post('/auth-google', { idToken, requestedRole: role }),
};

export const propertyService = {
  getAll: (params?: any) => api.get('/properties', { params }),
  getMyProperties: () => api.get('/properties', { params: { my: true } }),
  getById: (id: string) => api.get('/properties', { params: { id } }),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.put<any>(`/properties?id=${id}`, data),
  updateStatus: (id: number, statusId: number) => api.put<any>(`/properties?id=${id}`, { statusId }),
  delete: (id: string) => api.delete<any>(`/properties?id=${id}`),
};

export const userService = {
  getProfile: () => api.get('/user-profile'),
  updateProfile: (data: any) => api.put('/user-profile', data),
  upgradeToSeller: () => api.post('/user-profile', { upgrade: 'Vendedor' }),
};

export const commonService = {
  getValues: () => api.get('/common-values'),
};

export const requirementService = {
  getAll: () => api.get('/requirements'),
  getMyRequirements: () => api.get('/requirements', { params: { my: true } }),
  create: (data: any) => api.post('/requirements', data),
  delete: (id: string) => api.delete(`/requirements?id=${id}`),
};

export const matchingService = {
  getMatchesForRequirement: (requirementId: string) => api.get('/matching', { params: { requirementId } }),
  getInterestedBuyers: (propertyId: string) => api.get('/matching', { params: { propertyId } }),
};

export const adminService = {
  getUsers: () => api.get('/users-admin'),
  updateUser: (data: any) => api.put('/users-admin', data),
  updatePropertyStatus: (id: string, status: string) => api.put(`/properties?id=${id}`, { status }),
  getCommonValues: () => api.get('/admin-common-values'),
  upsertCommonValue: (data: any) => api.post('/admin-common-values', data),
  updateCommonValue: (data: any) => api.put('/admin-common-values', data),
};

export const cloudinaryService = {
  getSignature: () => api.post('/cloudinary-sign'),
  uploadImage: async (file: File, signatureData: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    
    // Cloudinary upload URL
    const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
    const res = await axios.post(url, formData);
    return res.data.secure_url;
  }
};

export default api;
