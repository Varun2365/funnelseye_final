import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('staffToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('staffToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email, password) {
    return this.api.post('/staffv2/auth/staff-login', { email, password });
  }

  async getCurrentUser() {
    console.log('🔍 [API Service] Getting current user...');
    const token = localStorage.getItem('staffToken');
    console.log('🔍 [API Service] Token exists:', !!token);
    console.log('🔍 [API Service] Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    return this.api.get('/staffv2/auth/me');
  }

  // Dashboard endpoints
  async getDashboardData(timeRange = 30) {
    return this.api.get(`/staff-dashboard/data?timeRange=${timeRange}`);
  }

  async getOverviewData(timeRange = 30) {
    return this.api.get(`/staff-dashboard/overview?timeRange=${timeRange}`);
  }

  async getPerformanceData(timeRange = 30) {
    return this.api.get(`/staff-dashboard/performance?timeRange=${timeRange}`);
  }

  async getTeamData(timeRange = 30) {
    return this.api.get(`/staff-dashboard/team?timeRange=${timeRange}`);
  }

  async getAchievementsData(timeRange = 30) {
    return this.api.get(`/staff-dashboard/achievements?timeRange=${timeRange}`);
  }

  // Tasks endpoints
  async getTasks() {
    return this.api.get('/staff-tasks');
  }

  async getTaskById(taskId) {
    return this.api.get(`/staff-tasks/${taskId}`);
  }

  async updateTaskStatus(taskId, status) {
    return this.api.patch(`/staff-tasks/${taskId}/status`, { status });
  }

  async addTimeLog(taskId, timeSpent, description) {
    return this.api.post(`/staff-tasks/${taskId}/time-log`, { 
      timeSpent, 
      description 
    });
  }

  // Profile endpoints
  async updateProfile(data) {
    return this.api.patch('/staff/profile', data);
  }

  async changePassword(currentPassword, newPassword) {
    return this.api.patch('/staff/change-password', {
      currentPassword,
      newPassword
    });
  }
}

export const apiService = new ApiService();
