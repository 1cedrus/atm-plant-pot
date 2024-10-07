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

interface AddNewReminderProps {
  isDisabled?: boolean;
}

export default function AddNewReminder({ isDisabled }: AddNewReminderProps) {
  const [duration, setDuration] = useState<string>();
  const [time, setTime] = useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-[180px]' variant='outline' disabled={isDisabled}>
          Add new reminder
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
            <Select value={duration} onValueChange={setDuration}>
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
            <Button variant='outline'>Cancel</Button>
            <Button>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
