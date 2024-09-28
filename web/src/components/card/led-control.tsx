import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LedMode } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LedControlCard() {
  const [ledMode, setLedMode] = useState<LedMode>(LedMode.Realtime);

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardTitle>Led Control</CardTitle>
        <CardDescription>Control led state based on your perferences</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <form className='flex flex-col gap-4'>
          <RadioGroup value={ledMode} onValueChange={(value) => setLedMode(value as LedMode)}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LedMode.Realtime} id={LedMode.Realtime} />
              <Label htmlFor={LedMode.Realtime}>Realtime</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LedMode.Adaptive} id={LedMode.Adaptive} />
              <Label htmlFor={LedMode.Adaptive}>Adaptive</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LedMode.Custom} id={LedMode.Custom} />
              <Label htmlFor={LedMode.Custom}>Custom</Label>
            </div>
          </RadioGroup>
          {ledMode === LedMode.Custom && (
            <div>
              <Select>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a led' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='led-1'>Led 1</SelectItem>
                  <SelectItem value='led-2'>Led 2</SelectItem>
                  <SelectItem value='led-3'>Led 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
