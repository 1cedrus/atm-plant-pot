import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AutomaticSettings, ManualSettings, Reminder, WateringMode, WebSocketEventType } from '@/types';
import { Separator } from '@/components/ui/separator';
import AddNewReminder from '@/components/AddNewReminder';
import ReminderCard from '@/components/ReminderCard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWateringMode, getWateringModeSettings, setWateringMode, updateWateringModeSettings } from '@/lib/apis';

export default function WateringModeCard() {
  const [threshold, setThreshold] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [realtime, setRealtime] = useState<boolean>();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const queryClient = useQueryClient();

  const wateringModeMutation = useMutation({
    mutationFn: (mode: WateringMode) => setWateringMode(mode),
    onSuccess: () =>
      queryClient.setQueryData([WebSocketEventType.WateringMode], (old) =>
        old === WateringMode.Automatic ? WateringMode.Manual : WateringMode.Automatic,
      ),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ mode, settings }: { mode: WateringMode; settings: any }) =>
      updateWateringModeSettings(mode, settings),
    onSuccess: () => {
      switch (mode) {
        case WateringMode.Manual:
          return queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => ({ ...old, realtime }));
        case WateringMode.Automatic:
          return queryClient.setQueryData([WateringMode.Automatic], {
            threshold,
            duration,
          });
      }
    },
  });

  const { data: mode } = useQuery({
    queryKey: [WebSocketEventType.WateringMode],
    queryFn: getWateringMode,
  });

  useQuery({
    queryKey: [WateringMode.Manual],
    queryFn: async () => {
      const res = (await getWateringModeSettings(WateringMode.Manual)) as any as ManualSettings;
      setRealtime(res.realtime);
      setReminders(res.reminders);
    },
  });

  const { data: automationSettings } = useQuery({
    queryKey: [WateringMode.Automatic],
    queryFn: async () => {
      const res = (await getWateringModeSettings(WateringMode.Automatic)) as any as AutomaticSettings;
      setThreshold(res.threshold);
      setDuration(res.duration);

      return res;
    },
  });

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
                  onCheckedChange={() => wateringModeMutation.mutate(WateringMode.Automatic)}
                />
                <Label htmlFor='automatic-mode'>{'Automatically water the plants'}</Label>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='threshold'>Moisture Threshold (%)</Label>
                <div className='flex gap-2'>
                  <Input
                    id='threshold'
                    type='number'
                    min='0'
                    max='100'
                    className='w-[180px]'
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    disabled={mode === WateringMode.Manual}
                  />
                  {mode === WateringMode.Automatic && threshold !== automationSettings?.threshold && (
                    <>
                      <Button
                        onClick={() =>
                          updateSettingsMutation.mutate({
                            mode: WateringMode.Automatic,
                            settings: { threshold, duration },
                          })
                        }>
                        Set
                      </Button>
                      <Button variant='outline' onClick={() => setThreshold(automationSettings?.threshold)}>
                        Reset
                      </Button>
                    </>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>Water when moisture level falls below {threshold}%</p>
              </div>
              <div className='space-y-2'>
                <Label>Choose water duration</Label>
                <Select
                  disabled={mode === WateringMode.Manual}
                  value={duration?.toString()}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({
                      mode: WateringMode.Automatic,
                      settings: { threshold, duration: value },
                    })
                  }>
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
                onCheckedChange={() => wateringModeMutation.mutate(WateringMode.Manual)}
              />
              <Label htmlFor='manual-mode'>{'Manually water the plants'}</Label>
            </div>
            <div className='flex flex-col gap-4'>
              <div className='text-sm flex items-center font-medium w-full justify-between'>
                Reminders
                <AddNewReminder isDisabled={mode === WateringMode.Automatic} />
              </div>
              <div>
                {reminders ? (
                  reminders.length === 0 ? (
                    <div className='text-muted-foreground'>No reminders set</div>
                  ) : (
                    <div className='flex flex-col gap-2'>
                      {reminders.map((reminder, index) => (
                        <ReminderCard key={index} reminder={reminder} isDisabled={mode === WateringMode.Automatic} />
                      ))}
                    </div>
                  )
                ) : (
                  <div className='text-xs'>Loading...</div>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'></CardFooter>
    </Card>
  );
}
