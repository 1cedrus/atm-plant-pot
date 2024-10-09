import { Switch } from '@/components/ui/switch';
import { deleteReminder, updateReminder } from '@/lib/apis';
import { ManualSettings, Reminder, WateringMode } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TimePickerDemo } from '@/components/ui/time-picker';
import { useState } from 'react';
import dayjs from 'dayjs';

interface ReminderCardProps {
  isDisabled?: boolean;
  reminder: Reminder;
}

export default function ReminderCard({ reminder, isDisabled }: ReminderCardProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number>(reminder.duration);
  const [time, setTime] = useState<Date | undefined>(new Date(reminder.time));

  const currentTime = new Date(reminder.time);

  const deleteReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => deleteReminder(reminder),
    onSuccess: () => {
      queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => {
        const newReminders = old.reminders.filter((r) => r.id !== reminder.id);
        return { ...old, reminders: newReminders };
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => updateReminder(reminder),
    onSuccess: (_, _reminder) => {
      queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => {
        const newReminders = old.reminders.map((r) => (r.id === _reminder.id ? _reminder : r));
        return { ...old, reminders: newReminders };
      });
    },
  });

  const onClose = () => {
    setOpen(false);
  };

  const onDelete = () => {
    deleteReminderMutation.mutate(reminder);
    onClose();
  };

  const onUpdate = () => {
    if (time === undefined || duration === undefined) return;
    updateReminderMutation.mutate({ ...reminder, time: time.getTime(), duration });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className=' flex items-center space-x-4 rounded-md border p-4 w-full hover:shadow cursor-pointer'>
          <div className='flex-1 space-y-1'>
            <p className='text-sm font-medium leading-none'>Time: {dayjs(reminder.time).format('hh:mm A')}</p>
            <p className='text-sm text-muted-foreground'>Duration: {reminder.duration}s</p>
          </div>
          <Switch
            disabled={isDisabled}
            checked={reminder.state}
            onCheckedChange={(value) => updateReminderMutation.mutate({ ...reminder, state: value })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update the reminder</DialogTitle>
          <DialogDescription>Set time and duration for the reminder.</DialogDescription>
        </DialogHeader>
        <div className='py-2 flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <Label>Choose time:</Label>
            <TimePickerDemo date={time} setDate={setTime} />
          </div>
          <div className='flex justify-between items-center'>
            <Label>Choose water duration:</Label>
            <Select value={duration?.toString()} onValueChange={(value) => setDuration(Number(value))}>
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
          </div>
        </div>
        <DialogFooter>
          <div className='flex justify-between w-full'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={onDelete}>
                Remove
              </Button>
              <Button
                onClick={onUpdate}
                disabled={time?.getTime() === currentTime.getTime() && duration === reminder.duration}>
                Update
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
