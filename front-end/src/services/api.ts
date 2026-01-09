const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001/api';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  }
};

// CMS API
export const cmsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/cms`);
    if (!response.ok) throw new Error('Failed to fetch CMS data');
    return response.json();
  },
  
  updateSection: async (section: string, data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/${section}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update CMS data');
    return response.json();
  }
};

// Portfolio API
export const portfolioAPI = {
  getAll: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_URL}/portfolio${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/portfolio/${id}`);
    if (!response.ok) throw new Error('Failed to fetch portfolio item');
    return response.json();
  },
  
  create: async (formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to create portfolio item');
    return response.json();
  },
  
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update portfolio item');
    return response.json();
  },
  
  delete: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete portfolio item');
    return response.json();
  }
};

// Submissions API
export const submissionsAPI = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to submit form');
    return response.json();
  },
  
  getAll: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },
  
  update: async (id: string, data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update submission');
    return response.json();
  },
  
  delete: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete submission');
    return response.json();
  }
};

// Pricing Tables API
export const pricingTablesAPI = {
  create: async (data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/pricing-tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create pricing table');
    return response.json();
  },
  
  update: async (id: string, data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/pricing-tables/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update pricing table');
    return response.json();
  },
  
  delete: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/pricing-tables/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete pricing table');
    return response.json();
  }
};

// Analytics API
export const analyticsAPI = {
  track: async (path: string, referrer: string, userAgent: string) => {
    try {
      await fetch(`${API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, referrer, userAgent })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  },
  
  getOverview: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/analytics/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }
};

// Certificates API
export const certificatesAPI = {
  upload: async (formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/certificates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload certificate');
    return response.json();
  },
  
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/certificates/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update certificate');
    return response.json();
  },
  
  delete: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/certificates/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete certificate');
    return response.json();
  }
};

// Brands API
export const brandsAPI = {
  upload: async (formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/brands`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload brand');
    return response.json();
  },
  
  delete: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/brands/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete brand');
    return response.json();
  },
  
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update brand');
    return response.json();
  }
};

// BCA Registrations API
export const bcaRegistrationsAPI = {
  updateSettings: async (data: { sectionTitle?: string; companyName?: string; uen?: string; bcaUrl?: string }) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update BCA settings');
    return response.json();
  },
  
  addContractor: async (data: { workhead: string; description: string; grade?: string; expiryDate?: string }) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/contractors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to add contractor');
    return response.json();
  },
  
  updateContractor: async (id: string, data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/contractors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update contractor');
    return response.json();
  },
  
  deleteContractor: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/contractors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete contractor');
    return response.json();
  },
  
  addBuilder: async (data: { licensingCode: string; description: string; expiryDate?: string }) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/builders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to add builder');
    return response.json();
  },
  
  updateBuilder: async (id: string, data: any) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/builders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update builder');
    return response.json();
  },
  
  deleteBuilder: async (id: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/cms/bca-registrations/builders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete builder');
    return response.json();
  }
};

