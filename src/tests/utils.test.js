import { describe, it, expect } from 'vitest';
import { capitalizeFirstLetter, getPressureMm, debounce } from '../utils';

describe('Utils Functions', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });

    it('should not affect already capitalized strings', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
  });

  describe('getPressureMm', () => {
    it('should convert hPa to mmHg correctly', () => {
      expect(getPressureMm(1013)).toBe(760); // Standard atmospheric pressure
    });

    it('should round to nearest integer', () => {
      expect(getPressureMm(1000)).toBe(750);
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      let called = false;
      const debouncedFn = debounce(() => {
        called = true;
      }, 100);

      debouncedFn();
      expect(called).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(called).toBe(true);
    });

    it('should cancel previous calls', async () => {
      let count = 0;
      const debouncedFn = debounce(() => {
        count++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(count).toBe(1); // Should only be called once
    });
  });
});
