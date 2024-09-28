import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sprout, Waves, Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthority } from '@/providers/auth-provider';

// Mock data for the soil moisture chart
const initialMockData = [
  { time: '00:00', moisture: 65 },
  { time: '04:00', moisture: 60 },
  { time: '08:00', moisture: 70 },
  { time: '12:00', moisture: 75 },
  { time: '16:00', moisture: 72 },
  { time: '20:00', moisture: 68 },
];

// Weather icon mapping
const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
};

type WeatherData = {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthority();
  const [soilMoisture, setSoilMoisture] = useState(70);
  const [waterLevel, setWaterLevel] = useState(85);
  const [_isWatering, setIsWatering] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [chartData, setChartData] = useState(initialMockData);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSoilMoisture((prev) => Math.max(0, Math.min(100, prev + Math.random() * 10 - 5)));
      setWaterLevel((prev) => Math.max(0, Math.min(100, prev - 0.5)));

      // Update chart data
      setChartData((prevData) => {
        const newData = [
          ...prevData.slice(1),
          {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            moisture: soilMoisture,
          },
        ];
        return newData;
      });
    }, 5000);

    // Simulate weather API call
    const fetchWeather = () => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          // 90% success rate
          const mockWeather = {
            main: {
              temp: Math.round(Math.random() * 15 + 10), // Random temp between 10-25°C
              humidity: Math.round(Math.random() * 40 + 40), // Random humidity between 40-80%
            },
            weather: [
              {
                main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                description: 'Mocked weather condition',
              },
            ],
          };
          setWeather(mockWeather);
        } else {
          setWeatherError('Failed to load weather data');
        }
      }, 1000); // Simulate network delay
    };

    fetchWeather();

    return () => clearInterval(interval);
  }, [soilMoisture]);

  const _handleWatering = () => {
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
      setSoilMoisture((prev) => Math.min(100, prev + 15));
      setWaterLevel((prev) => Math.max(0, prev - 10));
    }, 3000);
  };

  const WeatherIcon =
    weather && weatherIcons[weather.weather[0].main] ? weatherIcons[weather.weather[0].main] : Thermometer;

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Soil Moisture</CardTitle>
            <Sprout className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{soilMoisture.toFixed(1)}%</div>
            <Progress value={soilMoisture} className='mt-2' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Water Level</CardTitle>
            <Waves className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{waterLevel.toFixed(1)}%</div>
            <Progress value={waterLevel} className='mt-2' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Current Weather</CardTitle>
            <WeatherIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {weatherError ? (
              <div className='text-red-500'>{weatherError}</div>
            ) : weather ? (
              <div>
                <div className='text-2xl font-bold'>{weather.main.temp}°C</div>
                <div className='text-muted-foreground'>{weather.weather[0].description}</div>
                <div className='text-muted-foreground'>Humidity: {weather.main.humidity}%</div>
              </div>
            ) : (
              <div>Loading weather data...</div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Soil Moisture Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='time' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='moisture' stroke='#8884d8' />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
