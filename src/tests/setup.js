// Vitest test setup file
import { vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_WEATHER_API_KEY', 'test_api_key');
vi.stubEnv('VITE_WEATHER_BASE_URL', 'https://api.openweathermap.org/data/2.5');

// Mock fetch globally for tests
globalThis.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});
