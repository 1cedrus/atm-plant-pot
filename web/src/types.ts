export enum WateringMode {
  Automatic = 'automatic',
  Manual = 'manual',
}

export enum LedMode {
  Custom = 'custom',
  Realtime = 'realtime',
  Adaptive = 'adaptive',
}

export enum LEDState {
  On = 0,
  Starlight = 1,
  Off = 2
}

export interface LEDSettings {
  red: number;
  blue: number;
  green: number;
  brightness: number;
  state: LEDState;
}

