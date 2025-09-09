// API Configuration - using environment variables for security
export const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
export const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;
export const WEATHER_URL = `${BASE_URL}/weather`;
export const FORECAST_URL = `${BASE_URL}/forecast`;
