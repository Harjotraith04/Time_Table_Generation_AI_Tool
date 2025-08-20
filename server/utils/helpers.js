const crypto = require('crypto');
const moment = require('moment');

/**
 * Utility functions for the timetable generator
 */

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique identifier
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(6).toString('hex');
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${randomStr}`;
};

/**
 * Parse time string to minutes since midnight
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error('Invalid time string');
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format. Expected HH:MM');
  }

  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time string in HH:MM format
 */
const minutesToTimeString = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0 || minutes >= 1440) {
    throw new Error('Invalid minutes value. Must be between 0 and 1439');
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if two time ranges overlap
 * @param {string} start1 - Start time of first range
 * @param {string} end1 - End time of first range
 * @param {string} start2 - Start time of second range
 * @param {string} end2 - End time of second range
 * @returns {boolean} True if ranges overlap
 */
const timeRangesOverlap = (start1, end1, start2, end2) => {
  try {
    const s1 = parseTimeToMinutes(start1);
    const e1 = parseTimeToMinutes(end1);
    const s2 = parseTimeToMinutes(start2);
    const e2 = parseTimeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  } catch (error) {
    throw new Error(`Error checking time overlap: ${error.message}`);
  }
};

/**
 * Calculate duration between two times in minutes
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in minutes
 */
const calculateDuration = (startTime, endTime) => {
  try {
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);
    
    if (end < start) {
      throw new Error('End time cannot be before start time');
    }
    
    return end - start;
  } catch (error) {
    throw new Error(`Error calculating duration: ${error.message}`);
  }
};

/**
 * Generate time slots for a given range and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} slotDuration - Duration of each slot in minutes
 * @param {string[]} breakSlots - Array of break time ranges (e.g., ['12:00-13:00'])
 * @returns {Array} Array of time slot objects
 */
const generateTimeSlots = (startTime, endTime, slotDuration = 60, breakSlots = []) => {
  try {
    const slots = [];
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    let currentMinutes = startMinutes;
    let slotId = 0;
    
    while (currentMinutes + slotDuration <= endMinutes) {
      const slotStart = minutesToTimeString(currentMinutes);
      const slotEnd = minutesToTimeString(currentMinutes + slotDuration);
      
      // Check if this slot conflicts with break times
      const isBreakTime = breakSlots.some(breakSlot => {
        const [breakStart, breakEnd] = breakSlot.split('-');
        return timeRangesOverlap(slotStart, slotEnd, breakStart, breakEnd);
      });
      
      if (!isBreakTime) {
        slots.push({
          id: slotId++,
          startTime: slotStart,
          endTime: slotEnd,
          duration: slotDuration
        });
      }
      
      currentMinutes += slotDuration;
    }
    
    return slots;
  } catch (error) {
    throw new Error(`Error generating time slots: ${error.message}`);
  }
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string for safe use in database queries
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .trim();
};

/**
 * Calculate variance of an array of numbers
 * @param {number[]} values - Array of numbers
 * @returns {number} Variance
 */
const calculateVariance = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  
  return squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate standard deviation of an array of numbers
 * @param {number[]} values - Array of numbers
 * @returns {number} Standard deviation
 */
const calculateStandardDeviation = (values) => {
  return Math.sqrt(calculateVariance(values));
};

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (new array)
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Convert camelCase to snake_case
 * @param {string} str - String in camelCase
 * @returns {string} String in snake_case
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 * @param {string} str - String in snake_case
 * @returns {string} String in camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Get day of week from date
 * @param {Date} date - Date object
 * @returns {string} Day of week
 */
const getDayOfWeek = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create a rate limiter function
 * @param {number} maxCalls - Maximum number of calls
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Rate limiter function
 */
const createRateLimiter = (maxCalls, windowMs) => {
  const calls = [];
  
  return () => {
    const now = Date.now();
    
    // Remove calls outside the current window
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift();
    }
    
    if (calls.length >= maxCalls) {
      return false; // Rate limit exceeded
    }
    
    calls.push(now);
    return true; // Call allowed
  };
};

module.exports = {
  generateId,
  parseTimeToMinutes,
  minutesToTimeString,
  timeRangesOverlap,
  calculateDuration,
  generateTimeSlots,
  isValidEmail,
  sanitizeString,
  calculateVariance,
  calculateStandardDeviation,
  randomBetween,
  shuffleArray,
  deepClone,
  formatFileSize,
  camelToSnake,
  snakeToCamel,
  getDayOfWeek,
  isEmpty,
  retryWithBackoff,
  createRateLimiter
};
