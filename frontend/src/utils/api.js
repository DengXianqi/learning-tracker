const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  }
  
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    
    // Handle no content responses
    if (response.status === 204) {
      return null
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.details
      )
    }
    
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or parsing error
    throw new ApiError(
      error.message || 'Network error',
      0,
      null
    )
  }
}

export const api = {
  get: (endpoint, params) => {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : ''
    return request(`${endpoint}${queryString}`)
  },
  
  post: (endpoint, body) => {
    return request(endpoint, {
      method: 'POST',
      body
    })
  },
  
  put: (endpoint, body) => {
    return request(endpoint, {
      method: 'PUT',
      body
    })
  },
  
  patch: (endpoint, body) => {
    return request(endpoint, {
      method: 'PATCH',
      body
    })
  },
  
  delete: (endpoint) => {
    return request(endpoint, {
      method: 'DELETE'
    })
  }
}

// Goal-specific API calls
export const goalsApi = {
  getAll: (params) => api.get('/goals', params),
  getById: (id) => api.get(`/goals/${id}`),
  getStats: () => api.get('/goals/stats'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  updateStatus: (id, status) => api.patch(`/goals/${id}/status`, { status }),
  delete: (id) => api.delete(`/goals/${id}`)
}

// Milestone-specific API calls
export const milestonesApi = {
  getByGoalId: (goalId) => api.get(`/milestones/goal/${goalId}`),
  getById: (id) => api.get(`/milestones/${id}`),
  create: (goalId, data) => api.post(`/milestones/goal/${goalId}`, data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  complete: (id) => api.patch(`/milestones/${id}/complete`),
  uncomplete: (id) => api.patch(`/milestones/${id}/uncomplete`),
  toggle: (id) => api.patch(`/milestones/${id}/toggle`),
  delete: (id) => api.delete(`/milestones/${id}`),
  reorder: (goalId, milestoneIds) => api.put(`/milestones/goal/${goalId}/reorder`, { milestoneIds })
}

// Course-specific API calls
export const coursesApi = {
  search: (params) => api.get('/courses/search', params),
  getById: (id) => api.get(`/courses/${id}`),
  getRecommended: () => api.get('/courses/recommended/for-me'),
  save: (id) => api.post(`/courses/${id}/save`),
  getSaved: () => api.get('/courses/saved/list'),
  unsave: (id) => api.delete(`/courses/${id}/unsave`)
}

export default api
