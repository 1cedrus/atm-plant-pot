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
import { useState } from 'react';
import { TimePickerDemo } from '@/components/ui/time-picker';
import { PlusIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Reminder, WateringMode } from '@/types';
import { newReminder } from '@/lib/apis';

interface AddNewReminderProps {
  isDisabled?: boolean;
}

export default function AddNewReminder({ isDisabled }: AddNewReminderProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(5);
  const [time, setTime] = useState<Date | undefined>(new Date(Date.now()));

  const newReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => newReminder(reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WateringMode.Manual] });
    },
  });

  const onClose = () => {
    setDuration(5);
    setTime(new Date(Date.now()));
    setOpen(false);
  };

  const onSave = () => {
    if (time === undefined || duration === undefined) return;
    newReminderMutation.mutate({ time: time.getTime(), duration, state: true });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' disabled={isDisabled} size='icon'>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new reminder</DialogTitle>
          <DialogDescription>Set a time and duration for the reminder.</DialogDescription>
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
            <Button onClick={onSave} disabled={!time || !duration}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
