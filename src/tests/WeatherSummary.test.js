import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeatherSummary from '../components/WeatherSummary.vue';

describe('WeatherSummary Component', () => {
  const mockWeatherInfo = {
    name: 'Helsinki',
    sys: { country: 'FI' },
    main: {
      temp: 15.5,
      feels_like: 14.2,
    },
    weather: [
      {
        description: 'clear sky',
      },
    ],
  };

  it('renders weather information correctly', () => {
    const wrapper = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: true,
        isFavorited: false,
      },
    });

    expect(wrapper.text()).toContain('Helsinki');
    expect(wrapper.text()).toContain('FI');
    expect(wrapper.text()).toContain('Clear sky');
  });

  it('displays temperature in Celsius', () => {
    const wrapper = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: true,
        isFavorited: false,
      },
    });

    expect(wrapper.text()).toContain('°C');
  });

  it('displays temperature in Fahrenheit', () => {
    const wrapper = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: false,
        isFavorited: false,
      },
    });

    expect(wrapper.text()).toContain('°F');
  });

  it('emits toggle-favorite event when favorite button clicked', async () => {
    const wrapper = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: true,
        isFavorited: false,
      },
    });

    await wrapper.find('.favorite-btn').trigger('click');
    expect(wrapper.emitted('toggle-favorite')).toBeTruthy();
  });

  it('shows correct favorite icon state', () => {
    const wrapperNotFavorited = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: true,
        isFavorited: false,
      },
    });

    expect(wrapperNotFavorited.find('.favorite-btn').text()).toBe('☆');

    const wrapperFavorited = mount(WeatherSummary, {
      props: {
        weatherInfo: mockWeatherInfo,
        isCelsius: true,
        isFavorited: true,
      },
    });

    expect(wrapperFavorited.find('.favorite-btn').text()).toBe('★');
  });
});
