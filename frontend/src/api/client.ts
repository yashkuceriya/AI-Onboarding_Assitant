const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Network error. Please check your connection.');
  }

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.errors?.join(', ') || 'Request failed');
  }

  return res.json();
}

async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new Error('Network error. Please check your connection.');
  }

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    request<{ user: import('../types').User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: import('../types').User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // User
  getUser: () => request<import('../types').User>('/user'),

  updateUser: (data: Record<string, unknown>) =>
    request<{ user: import('../types').User }>('/user', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Conversations
  createConversation: () =>
    request<{ conversation: import('../types').Conversation; messages: import('../types').Message[] }>(
      '/conversations',
      { method: 'POST' }
    ),

  getConversation: (id: number) =>
    request<{ conversation: import('../types').Conversation; messages: import('../types').Message[] }>(
      `/conversations/${id}`
    ),

  sendMessage: (conversationId: number, content: string) =>
    request<{ user_message: import('../types').Message; assistant_message: import('../types').Message }>(
      `/conversations/${conversationId}/messages`,
      { method: 'POST', body: JSON.stringify({ content }) }
    ),

  completeConversation: (conversationId: number) =>
    request<{ profile: Record<string, unknown>; next_step: string }>(
      `/conversations/${conversationId}/complete`,
      { method: 'POST' }
    ),

  // Documents
  uploadDocument: (file: File, documentType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) formData.append('document_type', documentType);
    return uploadFile<import('../types').Document>('/documents', formData);
  },

  getDocument: (id: number) => request<import('../types').Document>(`/documents/${id}`),

  confirmDocument: (id: number, extractedData: Record<string, string>) =>
    request<import('../types').Document>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ extracted_data: extractedData }),
    }),

  // Appointments
  getAvailableSlots: () =>
    request<{ slots: import('../types').AvailableSlots }>('/appointments/available_slots'),

  bookAppointment: (slotId: number, notes?: string) =>
    request<import('../types').Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify({ slot_id: slotId, notes }),
    }),

  // Onboarding dashboard
  getDashboard: () => request<import('../types').DashboardData>('/onboarding/dashboard'),

  getProgress: () => request<import('../types').ProgressData>('/onboarding/progress'),

  updateStepProgress: (stepId: number, status: string) =>
    request<{ id: number; status: string }>(`/onboarding/steps/${stepId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  toggleChecklist: (checklistItemId: number) =>
    request<{ id: number; completed: boolean; completed_at: string | null }>(
      `/onboarding/checklist/${checklistItemId}/toggle`,
      { method: 'POST' }
    ),

  // Financial explainer
  explainFinancing: (data: { principal: number; apr: number; term_months: number }) =>
    request<import('../types').FinancialExplanation>('/financial/explain', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  whatIfScenarios: (data: { principal: number; apr: number; term_months: number; scenarios?: import('../types').WhatIfScenario[] }) =>
    request<import('../types').WhatIfResult>('/financial/what_if', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Vehicle recommendations
  getVehicleRecommendations: (preferences: Record<string, unknown>) =>
    request<import('../types').VehicleRecommendation[]>('/vehicles/recommend', {
      method: 'POST',
      body: JSON.stringify(preferences),
    }),

  // Trade-in
  estimateTradeIn: (data: { make: string; model: string; year: number; mileage: number; condition: string }) =>
    request<import('../types').TradeInEstimate>('/trade_ins/estimate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Support
  getAffirmation: () => request<import('../types').Affirmation>('/support/affirmation'),

  getResources: () =>
    request<{ resources: import('../types').SupportResource[] }>('/support/resources'),

  // Vehicle Inventory
  getVehicles: (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    return request<{ vehicles: import('../types').Vehicle[]; meta: import('../types').VehicleMeta }>(
      `/vehicles${qs ? `?${qs}` : ''}`
    );
  },

  getVehicle: (id: number) =>
    request<{ vehicle: import('../types').Vehicle; similar: import('../types').Vehicle[] }>(`/vehicles/${id}`),

  // Favorites
  getFavorites: () =>
    request<{ vehicles: import('../types').Vehicle[] }>('/favorites'),

  addFavorite: (vehicleId: number) =>
    request<{ favorited: boolean; vehicle_id: number }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ vehicle_id: vehicleId }),
    }),

  removeFavorite: (vehicleId: number) =>
    request<{ favorited: boolean; vehicle_id: number }>(`/favorites/${vehicleId}`, {
      method: 'DELETE',
    }),

  toggleFavorite: async (vehicleId: number, currentlyFavorited: boolean) => {
    if (currentlyFavorited) {
      return request<{ favorited: boolean; vehicle_id: number }>(`/favorites/${vehicleId}`, { method: 'DELETE' });
    } else {
      return request<{ favorited: boolean; vehicle_id: number }>('/favorites', {
        method: 'POST',
        body: JSON.stringify({ vehicle_id: vehicleId }),
      });
    }
  },

  // Compare
  compareVehicles: (ids: number[]) =>
    request<{ vehicles: import('../types').Vehicle[] }>('/vehicles/compare', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // Deliveries
  getDeliveries: () =>
    request<{ deliveries: import('../types').Delivery[] }>('/deliveries'),

  getDelivery: (id: number) =>
    request<import('../types').Delivery>(`/deliveries/${id}`),

  // Profile
  updateProfile: (data: Record<string, unknown>) =>
    request<{ user: import('../types').User }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: import('../types').Notification[]; unread_count: number }>(
      '/notifications'
    ),

  markNotificationRead: (id: number) =>
    request<import('../types').Notification>(`/notifications/${id}/mark_read`, {
      method: 'POST',
    }),

  markAllNotificationsRead: () =>
    request<{ unread_count: number }>('/notifications/mark_all_read', {
      method: 'POST',
    }),

  // Sell Your Car
  getSellOffers: () =>
    request<{ sell_offers: import('../types').SellOffer[] }>('/sell_offers'),

  getSellOffer: (id: number) =>
    request<import('../types').SellOffer>(`/sell_offers/${id}`),

  createSellOffer: (data: { make: string; model: string; year: number; mileage: number; condition: string; vin?: string; color?: string; trim?: string }) =>
    request<import('../types').SellOffer>('/sell_offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  acceptSellOffer: (id: number) =>
    request<import('../types').SellOffer>(`/sell_offers/${id}/accept`, { method: 'POST' }),

  uploadSellPhotos: (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('photos[]', f));
    return uploadFile<import('../types').SellOffer>(`/sell_offers/${id}/upload_photos`, formData);
  },

  scheduleSellPickup: (id: number, data: { pickup_date: string; pickup_address: string; pickup_time_slot: string }) =>
    request<import('../types').SellOffer>(`/sell_offers/${id}/schedule_pickup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
