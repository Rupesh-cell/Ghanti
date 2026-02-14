
/**
 * A utility to mimic the React Native Platform API.
 * This helps in making the web app codebase more portable and 
 * familiar for developers moving between React (Web) and React Native.
 */

export type OS = 'ios' | 'android' | 'web';

const getOS = (): OS => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  return 'web';
};

export const Platform = {
  OS: getOS(),
  isWeb: true, // In this context, it's always running in a browser
  isIOS: getOS() === 'ios',
  isAndroid: getOS() === 'android',
  
  /**
   * Returns the value provided for the current platform.
   * Usage: Platform.select({ ios: 10, android: 20, default: 15 })
   */
  select: <T>(options: { ios?: T; android?: T; web?: T; default?: T }): T | undefined => {
    const os = getOS();
    if (options[os] !== undefined) return options[os];
    if (options.web !== undefined) return options.web;
    return options.default;
  },

  /**
   * Version check (simulated for web)
   */
  Version: parseInt(window.navigator.appVersion, 10) || 0,
};

export default Platform;
