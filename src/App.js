import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('moisture');

  // Define healthy ranges
  const MOISTURE_HEALTHY_RANGE = { min: 0.2, max: 0.4 };
  const TEMPERATURE_HEALTHY_RANGE = { min: 15, max: 25 }; // in Celsius
  const NITROGEN_HEALTHY_RANGE = { min: 40, max: 80 }; // in ppm

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, replace this with actual API calls
        const mockData = generateMockData();
        setData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
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
        {['moisture', 'temperature', 'precipitation', 'nitrogen'].map((tab) => (
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
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={getHealthColor(getHealthStatus(payload[dataKey]))}
                stroke="#8884d8"
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Today's {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}</h3>
        <p style={{ fontSize: '16px' }}>
          {data[data.length - 1][dataKey].toFixed(2)} {unit}
          <span style={{
            marginLeft: '10px',
            padding: '5px 10px',
            borderRadius: '5px',
            backgroundColor: getHealthColor(getHealthStatus(data[data.length - 1][dataKey]))
          }}>
            {getHealthStatus(data[data.length - 1][dataKey])}
          </span>
        </p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Health Guide</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#ff9999', marginRight: '10px' }}></div>
          <span>Low (&lt; {healthyRange.min} {unit})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#99ff99', marginRight: '10px' }}></div>
          <span>Healthy ({healthyRange.min} - {healthyRange.max} {unit})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#9999ff', marginRight: '10px' }}></div>
          <span>High (&gt; {healthyRange.max} {unit})</span>
        </div>
      </div>
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
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="precipitation" fill="#8884d8" name="Precipitation" unit="mm" />
          <Line yAxisId="right" type="monotone" dataKey="moisture" stroke="#82ca9d" name="Soil Moisture" unit="m³/m³" />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Today's Precipitation</h3>
        <p style={{ fontSize: '16px' }}>{data[data.length - 1].precipitation.toFixed(2)} mm</p>
      </div>
    </div>
  );
};

export default CropMonitoringApp;
