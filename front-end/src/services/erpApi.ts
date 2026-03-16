const API_URL = import.meta.env.VITE_API_URL || '/api';

function erpHeaders(json = true) {
  const token = localStorage.getItem('erpToken');
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
    localStorage.removeItem('erpToken');
    localStorage.removeItem('erpUser');
    window.location.href = '/staff/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message || 'Request failed');
  }
  return res.json();
}

// ── Auth ──
export const erpAuthAPI = {
  login: (email: string, password: string) =>
    erpFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
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
