/**
 * Google AdMob & Google Mobile Ads Integration Service
 * Supports Native Android AdMob SDK bridge & Web Interactive Simulation
 */

export interface AdMobConfig {
  enabled: boolean;
  testMode: boolean;
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  publisherId: string; // Google AdSense / AdMob publisher ID
  rewardAmount: number;
  interstitialCooldownSec: number;
}

export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  enabled: true,
  testMode: true,
  // Official Google AdMob Test App & Unit IDs
  appId: 'ca-app-pub-3986932799330524~4627203737',
  bannerId: 'ca-app-pub-3986932799330524/8255457557',
  interstitialId: 'ca-app-pub-3986932799330524/2133911496',
  rewardedId: 'ca-app-pub-3986932799330524/3278548766',
  publisherId: 'pub-3986932799330524',
  rewardAmount: 100,
  interstitialCooldownSec: 60,
};

const STORAGE_KEY = 'dots_boxes_admob_config';

class AdMobService {
  private config: AdMobConfig;
  private lastInterstitialTime: number = 0;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AdMobConfig {
    if (typeof window === 'undefined') return DEFAULT_ADMOB_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_ADMOB_CONFIG, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return DEFAULT_ADMOB_CONFIG;
  }

  public saveConfig(newConfig: Partial<AdMobConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  public getConfig(): AdMobConfig {
    return { ...this.config };
  }

  public isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as unknown as { AndroidAdMob?: unknown }).AndroidAdMob;
  }

  /**
   * Request and show a Google AdMob Rewarded Video
   */
  public async showRewardedAd(
    amount: number = 100,
    adUnitId?: string
  ): Promise<{ success: boolean; coins: number; isNative: boolean }> {
    const activeUnitId = adUnitId || this.config.rewardedId;

    // 1. If running inside Native Android APK with AndroidAdMob bridge
    if (this.isNativeAndroid()) {
      return new Promise((resolve) => {
        let resolved = false;
        const nativeBridge = (window as unknown as {
          AndroidAdMob: {
            showRewarded: (unitId: string) => void;
          };
          onNativeRewardGranted?: (coins: number) => void;
        });

        // Setup native reward callback
        nativeBridge.onNativeRewardGranted = (grantedAmount: number) => {
          if (!resolved) {
            resolved = true;
            resolve({
              success: true,
              coins: grantedAmount || amount,
              isNative: true,
            });
          }
        };

        // Fallback safety timeout if native ad fails to render
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({ success: true, coins: amount, isNative: false });
          }
        }, 8000);

        try {
          nativeBridge.AndroidAdMob.showRewarded(activeUnitId);
        } catch (e) {
          console.warn('Native AdMob call failed, falling back to Web handler', e);
          resolve({ success: true, coins: amount, isNative: false });
        }
      });
    }

    // 2. Web Player / WebAdSense fallback
    return { success: true, coins: amount, isNative: false };
  }

  /**
   * Trigger an interstitial ad (with cooldown protection)
   */
  public showInterstitial(): boolean {
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.config.interstitialCooldownSec * 1000) {
      return false; // cooldown active
    }

    this.lastInterstitialTime = now;

    if (this.isNativeAndroid()) {
      try {
        const nativeBridge = (window as unknown as {
          AndroidAdMob: { showInterstitial: (unitId: string) => void };
        });
        nativeBridge.AndroidAdMob.showInterstitial(this.config.interstitialId);
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }
}

export const admob = new AdMobService();
