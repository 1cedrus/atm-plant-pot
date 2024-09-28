import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { WateringMode } from '@/lib/types';
import { Separator } from '../ui/separator';

export default function WateringModeCard() {
  const [mode, setMode] = useState<WateringMode>(WateringMode.Manual);
  const [threshold, setThreshold] = useState(50);
  const [wateringTime, setWateringTime] = useState([0]);

  const handleWateringModeChange = (selectedMode: WateringMode) => {
    if (selectedMode === mode) {
      setMode((mode) => (mode === WateringMode.Automatic ? WateringMode.Manual : WateringMode.Automatic));
    } else {
      setMode(selectedMode);
    }
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardDescription>Customize how you want your pot get water.</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <form>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-4'>
                <Switch
                  id='automatic-mode'
                  checked={mode === WateringMode.Automatic}
                  onCheckedChange={() => handleWateringModeChange(WateringMode.Automatic)}
                />
                <Label htmlFor='automatic-mode'>{'Automatically water the plants'}</Label>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='threshold'>Moisture Threshold (%)</Label>
                <Input
                  id='threshold'
                  type='number'
                  min='0'
                  max='100'
                  className='w-[180px]'
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
                <p className='text-sm text-muted-foreground'>Water when moisture level falls below {threshold}%</p>
              </div>
              <div className='space-y-2'>
                <Label>Choose water duration</Label>
                <Select>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Duration' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5s</SelectItem>
                    <SelectItem value='10'>10s</SelectItem>
                    <SelectItem value='15'>15s</SelectItem>
                    <SelectItem value='20'>20s</SelectItem>
                    <SelectItem value='30'>30s</SelectItem>
                    <SelectItem value='60'>60s</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-sm text-muted-foreground'>
                  It decide the duration water pump works when soil moisture below {threshold}%
                </p>
              </div>
            </div>
            <Separator />
            <div className='flex items-center gap-4'>
              <Switch
                id='manual-mode'
                checked={mode === WateringMode.Manual}
                onCheckedChange={() => handleWateringModeChange(WateringMode.Manual)}
              />
              <Label htmlFor='manual-mode'>{'Manually water the plants'}</Label>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
