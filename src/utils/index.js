/**
 * First letter to UpperCase
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return "";

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
 *
 */

export const getTime = (seconds) => {
  return new Date(seconds * 1000).toLocaleTimeString("fi-FI");
};
