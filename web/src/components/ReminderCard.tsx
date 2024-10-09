import { Switch } from '@/components/ui/switch';
import { updateReminder } from '@/lib/apis';
import { ManualSettings, Reminder, WateringMode } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReminderCardProps {
  isDisabled?: boolean;
  reminder: Reminder;
}

export default function ReminderCard({ reminder, isDisabled }: ReminderCardProps) {
  const queryClient = useQueryClient();

  const updateReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => updateReminder(reminder),
    onSuccess: () => {
      queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => {
        const newReminders = old.reminders.map((r) => (r.id === reminder.id ? reminder : r));
        return { ...old, reminders: newReminders };
      });
    },
  });

  return (
    <div className=' flex items-center space-x-4 rounded-md border p-4 w-[360px]'>
      <div className='flex-1 space-y-1'>
        <p className='text-sm font-medium leading-none'>Time: {reminder.time}</p>
        <p className='text-sm text-muted-foreground'>Duration: {reminder.duration}s</p>
      </div>
      <Switch
        disabled={isDisabled}
        checked={reminder.state}
        onCheckedChange={(value) => updateReminderMutation.mutate({ ...reminder, state: value })}
      />
    </div>
  );
}
