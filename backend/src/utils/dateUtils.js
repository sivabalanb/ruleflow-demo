/**
 * Utility functions for date-based rule conditions
 */

/**
 * Check if a date is on a weekend (Saturday or Sunday)
 * @param {string|Date} date - Date to check (ISO string or Date object)
 * @returns {boolean}
 */
export function isWeekend(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  } catch (error) {
    return false;
  }
}

/**
 * Get day name from a date
 * @param {string|Date} date - Date to check
 * @returns {string} - Day name (Monday, Tuesday, etc.)
 */
export function getDayName(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getUTCDay()];
  } catch (error) {
    return null;
  }
}

/**
 * Check if a date falls within a range
 * @param {string|Date} date - Date to check
 * @param {string|Date} startDate - Range start
 * @param {string|Date} endDate - Range end
 * @returns {boolean}
 */
export function isDateInRange(date, startDate, endDate) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    return dateObj >= start && dateObj <= end;
  } catch (error) {
    return false;
  }
}

/**
 * Get current date in ISO format
 * @returns {string}
 */
export function getCurrentDateISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format date to readable string
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return null;
  }
}

export default {
  isWeekend,
  getDayName,
  isDateInRange,
  getCurrentDateISO,
  formatDate
};
