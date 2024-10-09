export interface Props {
  className?: string;
  children?: React.ReactNode;
}

export enum WateringMode {
  Automatic = 'automatic',
  Manual = 'manual',
}

export enum LEDMode {
  Custom = 'custom',
  Realtime = 'realtime',
  Off = 'off',
}

export enum LEDState {
  On = 0,
  Starlight = 1,
  Off = 2,
}

export interface LED {
  id: number;
  red: number;
  blue: number;
  green: number;
  brightness: number;
  state: LEDState;
}

export enum WebSocketEventType {
  SoilMoisture = 'moisture',
  WaterLevel = 'water_level',
  Weather = 'weather',
  Position = 'position',
  WateringMode = 'watering_mode',
  LEDMode = 'led_mode',
}

export interface WebSocketEvent {
  type: WebSocketEventType;
}

export interface WaterLevel {
  water_level: number;
}

export interface SoilMoisture {
  moisture_level: number;
  timestamp: string;
}

export interface Weather {
  temp: number;
  humidity: number;
  conditions: string;
  datetime: string;
  description: string;
  cloudcover: number;
  precip: any;
  precipprob: number;
  solarradiation: number;
  icon: string;
}

export interface AutomaticSettings {
  threshold: number;
  duration: number;
}

export interface ManualSettings {
  realtime: boolean;
  reminders: Reminder[];
}

export interface Reminder {
  id?: number;
  time: number;
  duration: number;
  state: boolean;
}
