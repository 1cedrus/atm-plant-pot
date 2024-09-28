import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function WaterNowCard() {
  const [isWatering, setIsWatering] = useState(false);

  const handleWatering = () => {
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
      //setSoilMoisture(prev => Math.min(100, prev + 15))
      //setWaterLevel(prev => Math.max(0, prev - 10))
    }, 3000);
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardTitle>Water now</CardTitle>
        <CardDescription>Click the button below to water your pot</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex justify-center items-center'>
        <Button onClick={handleWatering} disabled={isWatering} className='p-20 rounded-full w-12 h-12 font-bold'>
          {isWatering ? 'Watering...' : 'Water Now'}
        </Button>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
