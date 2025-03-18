# SimpleWeatherApp

**SimpleWeatherApp** is a simple weather forecast application (SPA) developed using Vue.js, JS and SCSS.

## Description

The application allows users to get up-to-date weather information for a selected city. It provides the following features:

- **City search**: Enter a city name to get the weather forecast.
- **Current weather display**: Temperature, humidity, wind speed, and weather conditions description.
- **Multi-day forecast**: Weather information for the upcoming days.
- **Open API Integration**: The application uses an open API key to fetch weather data from OpenWeatherMap.

## Technologies

- **Vue.js**: JavaScript framework for building user interfaces.
- **SCSS**: CSS preprocessor for better structured and maintainable styles.
- **Vite**: Modern and fast frontend build tool.

## Project Structure

- `public/`: Static files.
- `src/`: Application source code.
  - `components/`: Vue components.
  - `assets/`: Resources such as images and styles.
- `index.html`: Main HTML file.
- `package.json`: Project dependencies and scripts.
- `vite.config.js`: Vite configuration.

## Installation and Running

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Jackcubbi/SimpleWeatherApp.git
   ```

2. **Navigate to the project directory and create constants folder:**

   ```bash
   cd SimpleWeatherApp
   ```

   **Create a constants folder with index.js**

   ```bash
   mkdir -p src/constants && touch src/constants/index.js
   ```

   **Set and export constants in index.js and use them in App.vue**

   ```bash
   export const API_KEY = "your_api_key";
   export const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the application:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173 or http://localhost:other_port`.

## Build for Production

To build the application for production, run:

```bash
npm run build
```

The build files will be located in the `dist/` directory.

## License

This project does not have a specified license. Please contact the author for more details.

---

_Note: This information is based on the contents of the [SimpleWeatherApp](https://github.com/Jackcubbi/SimpleWeatherApp) repository._
