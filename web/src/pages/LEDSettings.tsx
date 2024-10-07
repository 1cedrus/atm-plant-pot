import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LedMode, LEDSettings } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';

// Mock settings on one line
const mockSettings = {
  '0': { red: 255, blue: 0, green: 0, brightness: 100, state: 0 },
  '1': { red: 0, blue: 255, green: 0, brightness: 100, state: 0 },
  '2': { red: 0, blue: 0, green: 255, brightness: 100, state: 0 },
};

export default function LedControlCard() {
  const [ledMode, setLedMode] = useState<LedMode>(LedMode.Realtime);
  const [selectedLed, setSelectedLed] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, LEDSettings>>(mockSettings);

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardDescription>Control LEDs state based on your perferences</CardDescription>
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
              <Label htmlFor={LedMode.Adaptive}>Off</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LedMode.Custom} id={LedMode.Custom} />
              <Label htmlFor={LedMode.Custom}>Custom</Label>
            </div>
          </RadioGroup>
          {ledMode === LedMode.Custom && (
            <>
              <Separator />
              <div>
                <Label>Choose a LED</Label>
                <Select value={selectedLed} onValueChange={setSelectedLed}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select a LED' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>LED Sun</SelectItem>
                    <SelectItem value='1'>LED Cloud 1</SelectItem>
                    <SelectItem value='2'>LED Cloud 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedLed && (
                <div className='flex flex-col gap-2'>
                  <div>
                    <Label>State</Label>
                    <div>
                      <Select value={settings[selectedLed].state.toString()} onValueChange={() => {}}>
                        <SelectTrigger className='w-[180px]'>
                          <SelectValue placeholder='State of the LED' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='0'>On</SelectItem>
                          <SelectItem value='1'>Starlight</SelectItem>
                          <SelectItem value='2'>Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div>
                      <ColorPicker value='#00000' />
                    </div>
                  </div>
                  <div>
                    <Label>Brightness</Label>
                    <div>
                      <Slider defaultValue={[50]} max={100} step={1} className='w-[360px]' />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
