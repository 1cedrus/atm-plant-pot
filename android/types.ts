export enum WateringMode {
  AUTO = "auto",
  MANUAL = "manual"
}

export interface WateringReminder {
  time: Date;
  duration: number;
  isOn: boolean;
}

export interface LEDSettings {
  isOn: boolean;
  red: number;
  green: number;
  blue: number;
  brightness: number;
}

export enum OperationMode {
  Realtime = "realtime",
  Adaptive = "adaptive",
}
