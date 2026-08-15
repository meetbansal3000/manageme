export type DeviceType = 'PHONE' | 'TABLET' | 'LAPTOP/DESKTOP';

export interface DeviceSession {
  deviceId: string;
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  lastActive: number;
  createdAt: number;
  ip?: string;
}

const DEVICE_ID_KEY = 'manageme_device_id';

export const getOrCreateDeviceId = (): string => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `dev_volatile_${Date.now()}`;
  }
};

export const detectDeviceProperties = (): {
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
} => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const width = typeof window !== 'undefined' ? window.innerWidth || window.screen.width : 1200;
  const height = typeof window !== 'undefined' ? window.innerHeight || window.screen.height : 800;
  const touchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;

  // OS Detection
  let os = 'Unknown OS';
  if (/iPad|iPhone|iPod/.test(ua)) {
    os = 'iOS';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS';
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Browser Detection
  let browser = 'Web Browser';
  if (/Edg\//.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//.test(ua) && !/Chromium|Edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(ua) && !/Chrome|Chromium/.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Opera|OPR\//.test(ua)) {
    browser = 'Opera';
  }

  // Device Type Classification
  let deviceType: DeviceType = 'LAPTOP/DESKTOP';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|tablet|(android(?!.*mobile))/i.test(ua);

  if (isTabletUA || (touchPoints > 1 && width >= 768 && width <= 1024)) {
    deviceType = 'TABLET';
  } else if (isMobileUA || width < 768) {
    deviceType = 'PHONE';
  } else {
    deviceType = 'LAPTOP/DESKTOP';
  }

  // Human-Readable Device Label
  let deviceName = `${os} (${browser})`;
  if (deviceType === 'PHONE') {
    deviceName = os === 'iOS' ? `iPhone (${browser})` : `Android Phone (${browser})`;
  } else if (deviceType === 'TABLET') {
    deviceName = os === 'iOS' ? `iPad (${browser})` : `Tablet (${browser})`;
  } else {
    deviceName = os === 'macOS' ? `Mac (${browser})` : os === 'Windows' ? `Windows PC (${browser})` : `Workstation (${browser})`;
  }

  return {
    deviceType,
    deviceName,
    browser,
    os,
    screenWidth: width,
    screenHeight: height
  };
};

export const getCurrentDeviceSession = (): DeviceSession => {
  const deviceId = getOrCreateDeviceId();
  const info = detectDeviceProperties();

  return {
    deviceId,
    deviceType: info.deviceType,
    deviceName: info.deviceName,
    browser: info.browser,
    os: info.os,
    screenWidth: info.screenWidth,
    screenHeight: info.screenHeight,
    lastActive: Date.now(),
    createdAt: Date.now()
  };
};
