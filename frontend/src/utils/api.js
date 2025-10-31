import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Calculate discount based on customer tier and spending
 */
export const calculateDiscount = async (tier, total_spend, booking_date = null) => {
  try {
    const response = await api.post('/api/calculate', {
      tier,
      total_spend,
      ...(booking_date && { booking_date })
    });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
};

/**
 * Get all rules
 */
export const getRules = async () => {
  try {
    const response = await api.get('/api/rules');
    return response.data.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
};

/**
 * Update rules
 */
export const updateRules = async (rules) => {
  try {
    const response = await api.post('/api/rules', { rules });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
};

/**
 * Validate rules without saving
 */
export const validateRules = async (rules) => {
  try {
    const response = await api.post('/api/rules/validate', { rules });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
};

/**
 * Get rule schema documentation
 */
export const getRuleSchema = async () => {
  try {
    const response = await api.get('/api/rules/schema');
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data
    };
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: 'Server health check failed'
    };
  }
};

export default api;
