import { Switch } from '@/components/ui/switch';

interface ReminderCardProps {
  isDisabled?: boolean;
} 

export default function ReminderCard({ isDisabled }: ReminderCardProps) {
  return (
    <div className=' flex items-center space-x-4 rounded-md border p-4 w-[360px]'>
      <div className='flex-1 space-y-1'>
        <p className='text-sm font-medium leading-none'>Time: 10:00</p>
        <p className='text-sm text-muted-foreground'>Duration: 5s</p>
      </div>
      <Switch disabled={isDisabled}/>
    </div>
  );
}
