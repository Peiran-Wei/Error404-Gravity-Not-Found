
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

const API_KEY_OPENCAGE = '<YOUR_API>'; // Geocoding API
const API_KEY_WEATHERAPI = '<YOUR_ANOTHER_API>'; // Weather API

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
        <p style={{ fontWeight: 'bold' }}>{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toFixed(2)} ${entry.unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CropMonitoringApp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('moisture');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [weatherData, setWeatherData] = useState([]);

  const MOISTURE_HEALTHY_RANGE = { min: 0.2, max: 0.4 };
  const TEMPERATURE_HEALTHY_RANGE = { min: 15, max: 25 }; // in Celsius
  const NITROGEN_HEALTHY_RANGE = { min: 40, max: 80 }; // in ppm

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mockData = generateMockData();
        setData(mockData);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const generateMockData = () => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const moisture = Math.random() * 0.6 + 0.1;
      const temperature = Math.random() * 20 + 10;
      const precipitation = Math.random() * 10;
      const nitrogen = Math.random() * 100 + 20;
      return {
        date: date.toISOString().split('T')[0],
        moisture,
        temperature,
        precipitation,
        nitrogen,
      };
    }).reverse();
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Fetch geolocation data from OpenCage
      const geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${API_KEY_OPENCAGE}`);
      const geoData = await geoResponse.json();
      const { lat, lng } = geoData.results[0].geometry;

      // Prepare for multiple date requests
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateRange = getDateRange(start, end);

      const weatherResults = [];
      for (const date of dateRange) {
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/history.json?key=${API_KEY_WEATHERAPI}&q=${lat},${lng}&dt=${date}`
        );
        const weatherData = await weatherResponse.json();
        weatherResults.push({
          date: weatherData.forecast.forecastday[0].date,
          temperature: {
            min: weatherData.forecast.forecastday[0].day.mintemp_c,
            max: weatherData.forecast.forecastday[0].day.maxtemp_c,
          },
        });
      }

      setWeatherData(weatherResults);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#FFDDDD', border: '1px solid #FF0000', padding: '10px', margin: '10px' }}>
        <h2 style={{ color: '#FF0000' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Crop Monitoring Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        {['moisture', 'temperature', 'precipitation', 'nitrogen', 'weather'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px',
              marginRight: '10px',
              backgroundColor: activeTab === tab ? '#007BFF' : '#E9ECEF',
              color: activeTab === tab ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'moisture' && (
        <ChartPanel
          data={data}
          dataKey="moisture"
          unit="m³/m³"
          healthyRange={MOISTURE_HEALTHY_RANGE}
          title="Soil Moisture Over the Past Month"
        />
      )}
      {activeTab === 'temperature' && (
        <ChartPanel
          data={data}
          dataKey="temperature"
          unit="°C"
          healthyRange={TEMPERATURE_HEALTHY_RANGE}
          title="Temperature Over the Past Month"
        />
      )}
      {activeTab === 'precipitation' && (
        <PrecipitationChart data={data} />
      )}
      {activeTab === 'nitrogen' && (
        <ChartPanel
          data={data}
          dataKey="nitrogen"
          unit="ppm"
          healthyRange={NITROGEN_HEALTHY_RANGE}
          title="Nitrogen Levels Over the Past Month"
        />
      )}
      {activeTab === 'weather' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <button onClick={fetchWeatherData} style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
              Fetch Weather Data
            </button>
          </div>
          <TemperatureChart data={weatherData} />
        </>
      )}
    </div>
  );
};

const ChartPanel = ({ data, dataKey, unit, healthyRange, title }) => {
  const getHealthStatus = (value) => {
    if (value < healthyRange.min) return 'Low';
    if (value > healthyRange.max) return 'High';
    return 'Healthy';
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'Low': return '#ff9999';
      case 'High': return '#9999ff';
      case 'Healthy': return '#99ff99';
      default: return '#999999';
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#8884d8"
            name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
            dot={{ r: 3 }}
            unit={unit}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PrecipitationChart = ({ data }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Precipitation Over the Past Month</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="precipitation" barSize={20} fill="#8884d8" name="Precipitation" unit="mm" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const TemperatureChart = ({ data }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Temperature Over Selected Period</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature.min"
            stroke="#8884d8"
            name="Min Temperature"
            dot={{ r: 3 }}
            unit="°C"
          />
          <Line
            type="monotone"
            dataKey="temperature.max"
            stroke="#82ca9d"
            name="Max Temperature"
            dot={{ r: 3 }}
            unit="°C"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CropMonitoringApp;
