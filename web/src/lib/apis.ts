import axios from 'axios';

export const login = async (pin: string) => {
  return axios({
    method: 'post',
    url: '/api/login',
    data: {
      pin,
    },
  });
};

export const water = async () => {
  return axios({
    method: 'get',
    url: '/api/water',
  });
}

export const stopWater = async () => {
  return axios({
    method: 'get',
    url: '/api/stop-water',
  });
}

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

export const updatePosition = async (position: number) => {
  return axios({
    method: 'post',
    url: '/api/position',
    data: {
      position,
    },
  });
};

export const getSoilMoistureData = async (from: Date, to: Date) => {
  return axios({
    method: 'get',
    url: '/api/soil-moisture',
    params: {
      from,
      to,
    },
  });
};

export const getWateringMode = async () => {
  return axios({
    method: 'get',
    url: '/api/watering-mode',
  });
};

export const setWateringMode = async (mode: string) => {
  return axios({
    method: 'post',
    url: '/api/watering-mode',
    data: {
      mode,
    },
  });
};

export const getLedMode = async () => {
  return axios({
    method: 'get',
    url: '/api/led-mode',
  });
};

export const setLedMode = async (mode: string) => {
  return axios({
    method: 'post',
    url: '/api/led-mode',
    data: {
      mode,
    },
  });
};

