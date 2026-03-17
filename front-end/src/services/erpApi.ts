const API_URL = import.meta.env.VITE_API_URL || '/api';

function erpHeaders(json = true) {
  const token = localStorage.getItem('erpToken') || localStorage.getItem('adminToken');
  const h: Record<string, string> = {};
  if (json) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function erpFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}/erp${path}`, {
    ...opts,
    headers: { ...erpHeaders(), ...(opts.headers || {}) },
  });
  if (res.status === 401) {
    // Determine which login page to redirect to
    const hasAdminToken = !!localStorage.getItem('adminToken');
    localStorage.removeItem('erpToken');
    localStorage.removeItem('erpUser');
    // If user is an admin (in admin panel), go to admin login, not staff login
    if (!hasAdminToken) {
      window.location.href = '/staff/login';
    }
    throw new Error('Session expired — please log in again');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message || 'Request failed');
  }
  return res.json();
}

// ── Auth ──
export const erpAuthAPI = {
  login: async (email: string, password: string) => {
    // Login uses its own fetch to avoid the 401 redirect in erpFetch
    const res = await fetch(`${API_URL}/erp/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(body.message || 'Invalid email or password');
    }
    return res.json();
  },
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await fetch(`${API_URL}/erp/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(body.message || 'Registration failed');
    }
    return res.json();
  },
  me: () => erpFetch('/auth/me'),
  listUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/auth/users${qs}`);
  },
  createUser: (data: any) =>
    erpFetch('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) =>
    erpFetch(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Categories ──
export const categoriesAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/categories${qs}`);
  },
  get: (id: string) => erpFetch(`/categories/${id}`),
  create: (data: any) =>
    erpFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    erpFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    erpFetch(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Master Items ──
export const itemsAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/items${qs}`);
  },
  get: (id: string) => erpFetch(`/items/${id}`),
  create: (data: any) =>
    erpFetch('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    erpFetch(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    erpFetch(`/items/${id}`, { method: 'DELETE' }),
};

// ── Locations ──
export const locationsAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/locations${qs}`);
  },
  get: (id: string) => erpFetch(`/locations/${id}`),
  getStock: (id: string) => erpFetch(`/locations/${id}/stock`),
  create: (data: any) =>
    erpFetch('/locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    erpFetch(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    erpFetch(`/locations/${id}`, { method: 'DELETE' }),
};

// ── Inventory Operations ──
export const inventoryAPI = {
  receive: (data: { locationId: string; items: { itemId: string; quantity: number }[]; notes?: string }) =>
    erpFetch('/inventory/receive', { method: 'POST', body: JSON.stringify(data) }),
  createTransfer: (data: any) =>
    erpFetch('/inventory/transfer', { method: 'POST', body: JSON.stringify(data) }),
  dispatchTransfer: (id: string) =>
    erpFetch(`/inventory/transfer/${id}/dispatch`, { method: 'PATCH' }),
  receiveTransfer: (id: string) =>
    erpFetch(`/inventory/transfer/${id}/receive`, { method: 'PATCH' }),
  listTransfers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/inventory/transfers${qs}`);
  },
  adjust: (data: { locationId: string; itemId: string; newQuantity: number; notes?: string }) =>
    erpFetch('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  transactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/inventory/transactions${qs}`);
  },
  lowStock: () => erpFetch('/inventory/low-stock'),
  dashboard: () => erpFetch('/inventory/dashboard'),
  stockCount: (data: { locationId: string; counts: { itemId: string; physicalQuantity: number }[]; notes?: string }) =>
    erpFetch('/inventory/stock-count', { method: 'POST', body: JSON.stringify(data) }),
  valuation: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/inventory/valuation${qs}`);
  },
};

// ── Job Tickets ──
export const jobTicketsAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/jobs${qs}`);
  },
  get: (id: string) => erpFetch(`/jobs/${id}`),
  create: (data: any) =>
    erpFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    erpFetch(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  consume: (ticketId: string, data: { itemId: string; locationId: string; quantity: number; notes?: string }) =>
    erpFetch(`/jobs/${ticketId}/consume`, { method: 'POST', body: JSON.stringify(data) }),
  removeCostLine: (ticketId: string, lineId: string) =>
    erpFetch(`/jobs/${ticketId}/costline/${lineId}`, { method: 'DELETE' }),
  profitability: (id: string) => erpFetch(`/jobs/${id}/profitability`),
  // ── Job Tracking ──
  checkin: (id: string, data: { lat: number; lng: number }) =>
    erpFetch(`/jobs/${id}/checkin`, { method: 'POST', body: JSON.stringify(data) }),
  start: (id: string) =>
    erpFetch(`/jobs/${id}/start`, { method: 'POST', body: JSON.stringify({}) }),
  complete: (id: string, data: { technicianNotes?: string }) =>
    erpFetch(`/jobs/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  uploadImages: async (id: string, files: File[], type: 'before' | 'after') => {
    const formData = new FormData();
    formData.append('type', type);
    files.forEach(f => formData.append('images', f));
    const token = localStorage.getItem('erpToken') || localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}/erp/jobs/${id}/images`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(body.message || 'Upload failed');
    }
    return res.json();
  },
  history: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/jobs/history/my${qs}`);
  },
  // ── Customer Bookings ──
  myBookings: () => erpFetch('/jobs/my-bookings'),
  book: (data: any) =>
    erpFetch('/jobs/book', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Assets ──
export const assetsAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/assets${qs}`);
  },
  checkout: (id: string, data: { locationId?: string; jobTicketId?: string; notes?: string }) =>
    erpFetch(`/assets/${id}/checkout`, { method: 'POST', body: JSON.stringify(data) }),
  checkin: (id: string, data: { returnLocationId?: string; condition?: string; notes?: string }) =>
    erpFetch(`/assets/${id}/checkin`, { method: 'POST', body: JSON.stringify(data) }),
  maintenance: (id: string, action: string) =>
    erpFetch(`/assets/${id}/maintenance`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  history: (id: string) => erpFetch(`/assets/${id}/history`),
};

// ── Purchase Orders ──
export const purchaseOrdersAPI = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return erpFetch(`/purchase-orders${qs}`);
  },
  get: (id: string) => erpFetch(`/purchase-orders/${id}`),
  create: (data: any) =>
    erpFetch('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    erpFetch(`/purchase-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submit: (id: string) =>
    erpFetch(`/purchase-orders/${id}/submit`, { method: 'POST', body: JSON.stringify({}) }),
  approve: (id: string) =>
    erpFetch(`/purchase-orders/${id}/approve`, { method: 'POST', body: JSON.stringify({}) }),
  receive: (id: string, receivedLines: { lineId: string; quantity: number }[]) =>
    erpFetch(`/purchase-orders/${id}/receive`, { method: 'POST', body: JSON.stringify({ receivedLines }) }),
  cancel: (id: string) =>
    erpFetch(`/purchase-orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({}) }),
};
