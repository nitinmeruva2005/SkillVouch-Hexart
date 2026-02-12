import { User, ExchangeRequest, Message, ExchangeFeedback } from '../types';
import { suggestSkillsDirect, generateRoadmapDirect } from './mistralDirectService';

const API_BASE_URL = '/api';

// Token and session storage keys
const TOKEN_KEY = 'skillvouch_token';
const SESSION_KEY = 'skillvouch_session';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Safe UUID generator
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(16);
    (crypto as any).getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Get auth headers with token
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {

  // --- TOKEN & SESSION ---
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentSession: (): User | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  logout: async () => {
    apiService.removeToken();
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!apiService.getToken();
  },

  // --- AUTHENTICATION ---
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    // Save token and user
    apiService.setToken(data.token);
    apiService.setSession(data.user);

    return { user: data.user, token: data.token };
  },

  signup: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Signup failed');
    }

    // Save token and user
    apiService.setToken(data.token);
    apiService.setSession(data.user);

    return { user: data.user, token: data.token };
  },

  // --- USER PROFILE ---
  getUserProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch user profile');
    
    const data = await response.json();
    if (data.success) {
      apiService.setSession(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Failed to fetch profile');
  },

  updateUserProfile: async (updates: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    
    const data = await response.json();
    if (data.success) {
      apiService.setSession(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Failed to update profile');
  },

  addSkill: async (skill: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/user/add-skill`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill })
    });

    if (!response.ok) throw new Error('Failed to add skill');
    const data = await response.json();
    return data.skills;
  },

  addLearningGoal: async (goal: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/user/add-learning-goal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ goal })
    });

    if (!response.ok) throw new Error('Failed to add learning goal');
    const data = await response.json();
    return data.learningGoals;
  },

  // --- MESSAGING ---
  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, content })
    });

    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data.message;
  },

  getMessages: async (userId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages?userId=${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.messages;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/messages/unread`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) return 0;
    const data = await response.json();
    return data.count;
  },

  markAsRead: async (senderId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messages/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ senderId })
    });

    if (!response.ok) throw new Error('Failed to mark as read');
  },

  getConversations: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch conversations');
    const data = await response.json();
    return data.conversations;
  },

  // --- QUIZ ---
  submitQuiz: async (subjectName: string, score: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subjectName, score })
    });

    if (!response.ok) throw new Error('Failed to submit quiz');
    const data = await response.json();
    return data;
  },

  getQuizProgress: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/quiz/progress`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch quiz progress');
    const data = await response.json();
    return data;
  },

  addSubjectToLearn: async (subject: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/quiz/add-subject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject })
    });

    if (!response.ok) throw new Error('Failed to add subject');
    const data = await response.json();
    return data.subjectsToLearn;
  },

  generateQuiz: async (skill: string, difficulty: string) => {
    const response = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skillName: skill, difficulty })
    });

    if (!response.ok) throw new Error('Failed to generate quiz');
    return response.json();
  },

  // --- AI FEATURES ---
  generateRoadmap: async (skills: string[], learningGoals: string[]): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/ai/roadmap`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skills, learningGoals })
    });

    if (!response.ok) throw new Error('Failed to generate roadmap');
    const data = await response.json();
    return data.roadmap;
  },

  aiChat: async (message: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Failed to get AI response');
    const data = await response.json();
    return data.response;
  },

  getChatHistory: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat-history`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch chat history');
    const data = await response.json();
    return data.messages;
  },

  // --- PEER REQUESTS ---
  createExchangeRequest: async (request: ExchangeRequest) => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) throw new Error('Failed to create request');
  },

  getRequestsForUser: async (userId: string): Promise<ExchangeRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/requests?userId=${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  updateExchangeRequestStatus: async (id: string, status: ExchangeRequest['status']) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update request status');
    return response.json();
  },

  // --- FEEDBACK ---
  submitExchangeFeedback: async (feedback: Omit<ExchangeFeedback, 'id' | 'createdAt'> & Partial<Pick<ExchangeFeedback, 'id' | 'createdAt'>>): Promise<ExchangeFeedback> => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedback)
    });

    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  },

  getReceivedFeedback: async (userId: string): Promise<ExchangeFeedback[]> => {
    const response = await fetch(`${API_BASE_URL}/feedback/received?userId=${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  getFeedbackStats: async (userId: string): Promise<{ avgStars: number; count: number }> => {
    const response = await fetch(`${API_BASE_URL}/feedback/stats?userId=${userId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch feedback stats');
    return response.json();
  },

  // --- USER LIST (PUBLIC) ---
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const result = await response.json();
    return result.data || [];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) return undefined;
      return response.json();
    } catch {
      return undefined;
    }
  }
};

// Initialize: Check if user is logged in on app load
export const initializeAuth = async (): Promise<User | null> => {
  if (!apiService.isAuthenticated()) return null;
  
  try {
    const user = await apiService.getUserProfile();
    return user;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    apiService.logout();
    return null;
  }
};
