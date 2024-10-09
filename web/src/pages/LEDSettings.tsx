import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LED, LEDMode, LEDState, WebSocketEventType } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLEDCustomSettings, getLEDMode, setLEDMode, updateLED } from '@/lib/apis';

export default function LedControlCard() {
  const queryClient = useQueryClient();
  const [selectedLED, setSelectedLED] = useState<LED>();
  const [settings, setSettings] = useState<Record<number, LED>>({});

  useQuery({
    queryKey: [LEDMode.Custom],
    queryFn: async () => {
      const res = await getLEDCustomSettings();
      const settings: Record<number, LED> = res.reduce(
        (_s, curr) => ({
          [curr.id]: curr,
          ..._s,
        }),
        {} as Record<number, LED>,
      );

      setSettings(settings);
    },
  });

  const { data: ledMode } = useQuery({
    queryKey: [WebSocketEventType.LEDMode],
    queryFn: getLEDMode,
  });

  const updateLEDModeMutation = useMutation({
    mutationFn: (mode: LEDMode) => setLEDMode(mode),
    onSuccess: () => {
      queryClient.setQueryData([WebSocketEventType.LEDMode], ledMode);
    },
  });

  const updateLEDMutation = useMutation({
    mutationFn: (LED: LED) => updateLED(LED),
    onSuccess: () => {
      queryClient.setQueryData([LEDMode.Custom], settings);
    },
  });

  const selectLED = (id: number) => {
    setSelectedLED(settings[id]);
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardDescription>Control LEDs state based on your perferences</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <form className='flex flex-col gap-4'>
          <RadioGroup value={ledMode} onValueChange={(value) => updateLEDModeMutation.mutate(value as LEDMode)}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LEDMode.Realtime} id={LEDMode.Realtime} />
              <Label htmlFor={LEDMode.Realtime}>Realtime</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LEDMode.Off} id={LEDMode.Off} />
              <Label htmlFor={LEDMode.Off}>Off</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={LEDMode.Custom} id={LEDMode.Custom} />
              <Label htmlFor={LEDMode.Custom}>Custom</Label>
            </div>
          </RadioGroup>
          {ledMode === LEDMode.Custom && (
            <>
              <Separator />
              <div>
                <Label>Choose a LED</Label>
                <Select value={selectedLED?.id.toString()} onValueChange={(value) => selectLED(Number(value))}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select a LED' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(settings).map((key) => (
                      <SelectItem key={key} value={key}>
                        LED {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLED && (
                <div className='flex flex-col gap-2'>
                  <div>
                    <Label>State</Label>
                    <div>
                      <Select
                        value={selectedLED.state.toString()}
                        onValueChange={(value) =>
                          setSelectedLED((prev) => ({ ...prev!, state: Number(value) as LEDState }))
                        }>
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
                      <ColorPicker
                        value={`#${selectedLED.red.toString(16).padStart(2, '0')}${selectedLED.green.toString(16).padStart(2, '0')}${selectedLED.blue.toString(16).padStart(2, '0')}
                      `}
                        onChange={(value) => {
                          const [red, green, blue] = value
                            .slice(1)
                            .match(/.{2}/g)!
                            .map((v) => parseInt(v, 16));
                          setSelectedLED((prev) => ({ ...prev!, red, green, blue }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Brightness</Label>
                    <div>
                      <Slider
                        defaultValue={[50]}
                        max={100}
                        step={1}
                        className='w-[360px]'
                        value={[(selectedLED.brightness / 255) * 100]}
                        onValueChange={(value) =>
                          setSelectedLED((prev) => ({ ...prev!, brightness: Math.round((value[0] / 100) * 255) }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        {selectedLED &&
          (selectedLED.state !== settings[selectedLED.id].state ||
            selectedLED.red !== settings[selectedLED.id].red ||
            selectedLED.green !== settings[selectedLED.id].green ||
            selectedLED.blue !== settings[selectedLED.id].blue ||
            selectedLED.brightness !== settings[selectedLED.id].brightness) && (
            <>
              <Button variant='outline' onClick={() => selectLED(selectedLED.id)}>Cancel</Button>
              <Button onClick={() => updateLEDMutation.mutate(selectedLED)}>Save</Button>
            </>
          )}
      </CardFooter>
    </Card>
  );
}
