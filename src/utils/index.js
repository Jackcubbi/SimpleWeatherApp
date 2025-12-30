/**
 * First letter to UpperCase
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert hPa units to mmhg
 */
const Pressure_Units = 0.750062;
export const getPressureMm = (hpa) => {
  return Math.round(hpa * Pressure_Units);
};

/**
 * Set time zone offset
 */
export const getTime = (seconds) => {
  return new Date(seconds * 1000).toLocaleTimeString('fi-FI', {
    timeZone: 'Europe/Helsinki',
  });
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 500) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
