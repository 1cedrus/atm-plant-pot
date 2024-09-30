export enum WateringMode {
  Automatic = 'automatic',
  Manual = 'manual',
}

export enum LedMode {
  Custom = 'custom',
  Realtime = 'realtime',
  Adaptive = 'adaptive',
}

export interface LEDSettings {
  red: number;
  blue: number;
  green: number;
  brightness: number;
  duration: number;
}

