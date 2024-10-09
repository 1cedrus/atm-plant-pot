import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sprout, Waves } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { useQuery } from '@tanstack/react-query';
import {
  getSoilMoisture,
  getSoilMoistureData,
  getWaterLevel,
  getWeather,
  stopWater,
  updatePosition,
  water,
} from '@/lib/apis';
import { timeAgo } from '@/lib/time';
import { addDays, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { WebSocketEventType } from '@/types';
import { useBackdrop } from '@/components/ui/backdrop';
import { Input } from '@/components/ui/input';
import useToast from '@/hooks/useToast';
import { ReloadIcon } from '@radix-ui/react-icons';

export default function Dashboard() {
  const { onOpen, onClose } = useBackdrop();
  const [tryPosition, setTryPosition] = useState<string>('');
  const [onChecking, setOnChecking] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(Date.now()), 30),
    to: new Date(Date.now()),
  });

  const { data: soilMoisture } = useQuery({
    queryKey: [WebSocketEventType.SoilMoisture],
    queryFn: getSoilMoisture,
  });

  const { data: waterLevel } = useQuery({
    queryKey: [WebSocketEventType.WaterLevel],
    queryFn: getWaterLevel,
  });

  const { data: weather } = useQuery({
    queryKey: [WebSocketEventType.Weather],
    queryFn: getWeather,
  });

  const { data: soilMoistureData } = useQuery({
    queryKey: [WebSocketEventType.SoilMoisture, date],
    queryFn: async () => {
      if (date?.from === undefined || date?.to === undefined) return [];
      const data = await getSoilMoistureData(date!.from!.getTime(), addDays(date!.to!, 1).getTime());

      return data.map(({ timestamp, moisture_level }) => ({
        timestamp: format(new Date(timestamp), 'MM/dd/yyyy HH:mm'),
        moisture_level: ((moisture_level / 4095) * 100).toFixed(2),
      }));
    },
  });

  const handleWatering = async () => {
    if (isWatering) {
      await stopWater();
    } else {
      await water();
    }

    setIsWatering((prev) => !prev);
  };

  const handleTryPosition = async () => {
    setOnChecking(true);

    try {
      await updatePosition(tryPosition);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update position',
        variant: 'destructive',
      });
    }

    setTryPosition('');
    setOnChecking(false);
  };

  useEffect(() => {
    if (!soilMoisture || !waterLevel || !weather || !soilMoistureData) {
      onOpen();
    } else {
      onClose();
    }

    return () => {
      onClose();
    };
  }, [soilMoisture, waterLevel, weather, soilMoistureData]);

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        <Card className='flex flex-col justify-between'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Soil Moisture</CardTitle>
            <Sprout className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {soilMoisture ? (
              <>
                <div className='flex gap-2 items-baseline'>
                  <div className='text-2xl font-bold'>{((soilMoisture.moisture_level / 4095) * 100).toFixed(2)}%</div>
                  <div className='text-xs text-gray-600'>{timeAgo(soilMoisture.timestamp)}</div>
                </div>
                <Progress value={(soilMoisture.moisture_level / 4095) * 100} className='mt-2' />
              </>
            ) : (
              <div>Loading...</div>
            )}
          </CardContent>
        </Card>
        <Card className='flex flex-col justify-between'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Water Level</CardTitle>
            <Waves className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='flex-1'>
            {waterLevel ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 h-full'>
                <Button variant='outline' className='text-2xl font-bold h-full'>
                  {waterLevel.water_level === 0 ? '⬇️ 30%' : '⬆️  30%'}
                </Button>
                <Button className='h-full font-bold text-2xl' variant='outline' onClick={handleWatering}>
                  <span className={isWatering ? 'animate-spin mr-2' : 'mr-2'}>💦</span>
                  {isWatering ? 'Stop' : 'Water'}
                </Button>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </CardContent>
        </Card>
        <Dialog>
          <DialogTrigger>
            <Card>
              <CardHeader className='flex flex-row justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Current Weather</CardTitle>
                <img src={`src/assets/weather-icon/${weather?.icon}.svg`} className='h-10 w-10 text-muted-foreground' />
              </CardHeader>
              <CardContent className='text-left'>
                {weather ? (
                  <div>
                    <div className='font-bold'>{weather?.address}</div>
                    <div className='text-2xl font-bold'>{weather.temp}°F</div>
                    <div className='text-muted-foreground'>Humidity: {weather.humidity}%</div>
                    <div className='text-muted-foreground'>{weather.description}</div>
                  </div>
                ) : (
                  <div>Loading weather data...</div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weather Information</DialogTitle>
              <DialogDescription>
                The current weather in update using the Visual Crossing Weather API.
              </DialogDescription>
              <div className='flex gap-4 py-4 items-center '>
                <img src={`src/assets/weather-icon/${weather?.icon}.svg`} className='h-20 w-20 text-muted-foreground' />
                <div>
                  <div className='font-bold'>{weather?.address}</div>
                  <div className='text-2xl font-bold'>{weather?.temp}°F</div>
                  <div className='text-muted-foreground'>Humidity: {weather?.humidity}%</div>
                  <div className='text-muted-foreground'>{weather?.description}</div>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter>
              <div className='flex w-full justify-between items-end gap-2'>
                <div className='w-full'>
                  <Label htmlFor='location'>Location:</Label>
                  <Input
                    id='location'
                    placeholder='Enter location you want to show weather information'
                    className='w-full'
                    autoFocus={false}
                    value={tryPosition}
                    onChange={(e) => setTryPosition(e.currentTarget.value)}
                  />
                </div>
                <Button disabled={!tryPosition} onClick={handleTryPosition} className='w-[5rem]'>
                  {onChecking ? <ReloadIcon className='h-4 w-4 animate-spin' /> : 'Check'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className='mt-6'>
        <CardHeader className='flex flex-row justify-between'>
          <CardTitle>Soil Moisture Over Time</CardTitle>
          <DatePickerWithRange date={date} setDate={setDate} />
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={soilMoistureData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='timestamp' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='moisture_level' stroke='#8884d8' />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
