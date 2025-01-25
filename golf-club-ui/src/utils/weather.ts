interface WeatherResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}

export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherResponse> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
      `&timezone=auto` +
      `&temperature_unit=fahrenheit` +
      `&forecast_days=3`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

// Weather code mapping to icons and descriptions
export const getWeatherInfo = (code: number): { icon: string, description: string } => {
  const weatherMap: { [key: number]: { icon: string, description: string } } = {
    0: { icon: 'clear_day', description: 'Clear' },
    1: { icon: 'partly_cloudy_day', description: 'Mostly Clear' },
    2: { icon: 'partly_cloudy_day', description: 'Partly Cloudy' },
    3: { icon: 'cloudy', description: 'Cloudy' },
    45: { icon: 'foggy', description: 'Foggy' },
    48: { icon: 'foggy', description: 'Foggy' },
    51: { icon: 'rainy_light', description: 'Light Rain' },
    53: { icon: 'rainy', description: 'Rain' },
    55: { icon: 'rainy_heavy', description: 'Heavy Rain' },
    61: { icon: 'rainy_light', description: 'Light Rain' },
    63: { icon: 'rainy', description: 'Rain' },
    65: { icon: 'rainy_heavy', description: 'Heavy Rain' },
    71: { icon: 'weather_snowy', description: 'Light Snow' },
    73: { icon: 'weather_snowy', description: 'Snow' },
    75: { icon: 'weather_snowy_heavy', description: 'Heavy Snow' },
    95: { icon: 'thunderstorm', description: 'Thunderstorm' },
  };

  return weatherMap[code] || { icon: 'question_mark', description: 'Unknown' };
}; 