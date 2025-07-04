import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { GeoAltFill } from 'react-bootstrap-icons';

function App() {
  const API_KEY = "febd8e353be545de87d153817250407";
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("Locating...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (location) => {
    setLoading(true);
    setError(null);
    try {
      const currentResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`);
      if (!currentResponse.ok) throw new Error('Location not found');
      const currentData = await currentResponse.json();
      
      const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=5`);
      if (!forecastResponse.ok) throw new Error('Forecast data unavailable');
      const forecastData = await forecastResponse.json();

      setForecastData(forecastData.forecast.forecastday);
      setWeatherData(currentData);
      // Update city name with the resolved location name
      setCity(currentData.location.name);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setCity("Casablanca");
      fetchWeatherData("Casablanca");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setCity("Locating...");
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get your location. Showing default weather.");
          setCity("Casablanca");
          fetchWeatherData("Casablanca");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setCity("Casablanca");
      fetchWeatherData("Casablanca");
    }
  };

  useEffect(() => {
    // Try to get user location by default when component mounts
    getUserLocation();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() !== "" && city !== "Locating...") {
      fetchWeatherData(city);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="weather-app">
      <div className="container ">
        {/* Search Bar */}
        <div className="d-flex justify-content-center mb-4 ">
          <form onSubmit={handleSearch} className="search-bar search-container">
            <div className="input-group ">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name"
                className="form-control"
              />
              <button 
                type="submit"
                className="btn btn-outline-light py-3"
                disabled={city === "Locating..."}
              >
                Search
              </button>
            </div>
          </form>
          <button 
            onClick={getUserLocation}
            className="location-btn mx-2 p-3"
            title="Use my current location"
          >
            <GeoAltFill size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-warning text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
          </div>
        )}

        {/* Current Weather */}
        {weatherData && !loading && (
          <div className="current-weather text-center mb-5">
            <h1 className="city-name mb-3">{weatherData.location.name}, {weatherData.location.country}</h1>
            <div className="temperature display-2 mb-2">
              {Math.round(weatherData.current.temp_c)}
            </div>
            <div className="weather-condition fs-4">
              <img 
                src={weatherData.current.condition.icon} 
                alt={weatherData.current.condition.text} 
                className="me-2"
              />
              {weatherData.current.condition.text}
            </div>
            <div className="weather-details mt-4 row justify-content-center">
              <div className="col-4 col-md-3">
                <div className="detail-label">Humidity</div>
                <div className="detail-value">{weatherData.current.humidity}%</div>
              </div>
              <div className="col-4 col-md-3">
                <div className="detail-label">Wind</div>
                <div className="detail-value">{weatherData.current.wind_kph} km/h</div>
              </div>
              <div className="col-4 col-md-3">
                <div className="detail-label">Feels Like</div>
                <div className="detail-value">{Math.round(weatherData.current.feelslike_c)}°C</div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecastData.length > 0 && !loading && (
          <div className="forecast">
            <h2 className="text-center mb-4">5-Day Forecast</h2>
            <div className="forecast-days">
              {forecastData.map((day, index) => (
                <div 
                  key={index} 
                  className="forecast-day"
                  style={{ '--order': index }}
                >
                  <div className="day-name fw-bold mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <img 
                    src={day.day.condition.icon} 
                    alt={day.day.condition.text} 
                    className="mb-2"
                  />
                  <div className="day-temp mb-1">
                    {Math.round(day.day.avgtemp_c)}°C
                  </div>
                  <div className="day-condition small">
                    {day.day.condition.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;