import {
  AutomaticSettings,
  LED,
  LEDMode,
  ManualSettings,
  Reminder,
  SoilMoisture,
  WateringMode,
  WaterLevel,
  Weather,
} from '@/types';
import axios from 'axios';

export const login = async (pin: string): Promise<{ access_token: string }> => {
  return axios({
    method: 'post',
    url: '/api/login',
    data: {
      pin,
    },
  });
};

export const getSoilMoisture = async (): Promise<SoilMoisture> => {
  return axios({
    method: 'get',
    url: '/api/soil-moisture',
  });
};

export const getWeather = async (): Promise<Weather> => {
  return axios({
    method: 'get',
    url: '/api/weather',
  });
};

export const getWaterLevel = async (): Promise<WaterLevel> => {
  return axios({
    method: 'get',
    url: '/api/water-level',
  });
};

export const water = async () => {
  return axios({
    method: 'get',
    url: '/api/mqtt/water',
  });
};

export const stopWater = async () => {
  return axios({
    method: 'get',
    url: '/api/mqtt/stop-water',
  });
};

export const changePassword = async (oldPin: string, newPin: string) => {
  return axios({
    method: 'post',
    url: '/api/change-password',
    data: {
      oldPin,
      newPin,
    },
  });
};

export const getPosition = async () => {
  return axios({
    method: 'get',
    url: '/api/position',
  });
};

export const updatePosition = async (position: string) => {
  return axios({
    method: 'post',
    url: '/api/position',
    data: {
      position,
    },
  });
};

export const getSoilMoistureData = async (from_: number, to: number): Promise<SoilMoisture[]> => {
  return axios({
    method: 'get',
    url: '/api/soil-moisture',
    params: {
      from_,
      to,
    },
  });
};

export const getWateringMode = async (): Promise<WateringMode> => {
  return axios({
    method: 'get',
    url: '/api/watering-mode',
  });
};

export const deleteReminder = async (reminder: Reminder) => {
  return axios({
    method: 'delete',
    url: `/api/reminder/${reminder.id}`,
  });
};

export const updateReminder = async (reminder: Reminder) => {
  return axios({
    method: 'post',
    url: `/api/reminder/${reminder.id}`,
    data: reminder,
  });
};

export const newReminder = async (reminder: Reminder) => {
  return axios({
    method: 'post',
    url: '/api/reminder',
    data: reminder,
  });
};

export const updateWateringModeSettings = async (settings: AutomaticSettings) => {
  return axios({
    method: 'post',
    url: `/api/mqtt/${WateringMode.Automatic}`,
    data: settings,
  });
};

export const setWateringMode = async (mode: WateringMode) => {
  return axios({
    method: 'post',
    url: '/api/mqtt/watering-mode',
    data: {
      mode,
    },
  });
};

export const getWateringModeSettings = async (mode: WateringMode): Promise<AutomaticSettings | ManualSettings> => {
  return axios({
    method: 'get',
    url: '/api/watering-mode',
    params: {
      mode,
    },
  });
};

export const updateLED = async (customStr: string) => {
  return axios({
    method: 'post',
    url: `/api/mqtt/led-custom`,
    data: {
      message: customStr,
    },
  });
};

export const getLEDCustomSettings = async (): Promise<LED[]> => {
  return axios({
    method: 'get',
    url: '/api/led-settings',
  });
};

export const setLEDMode = async (mode: LEDMode) => {
  return axios({
    method: 'post',
    url: '/api/mqtt/led-mode',
    data: {
      mode,
    },
  });
};

export const getLEDMode = async (): Promise<LEDMode> => {
  return axios({
    method: 'get',
    url: '/api/led-mode',
  });
};
