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
 * Convert Unix timestamp to local time string
 * Unix timestamp in seconds
 * Formatted time string (HH:MM:SS)
 *
 **/
export const getTime = (seconds) => {
  const date = new Date(seconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
