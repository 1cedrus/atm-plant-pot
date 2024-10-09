import { useState } from 'react';
import { Input } from './ui/input';

export default function ProvinceSelector() {
  const [inputValue, setInputValue] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  return (
    <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
  );
}
