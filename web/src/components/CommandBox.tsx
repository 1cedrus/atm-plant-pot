import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function ServerConfiguration() {
  const [open, setOpen] = React.useState(false);
  const [http, setHttp] = React.useState('');
  const [ws, setWs] = React.useState('');

  const update = () => {
    localStorage.set('http', http);
    localStorage.set('ws', ws);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Server Configuration</DialogTitle>
        </DialogHeader>
        <Input placeholder='HTTP' value={http} onChange={(e) => setHttp(e.currentTarget.value)} />
        <Input placeholder='WS' value={ws} onChange={(e) => setWs(e.currentTarget.value)} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='secondary'>Close</Button>
          </DialogClose>
          <Button onClick={update}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
