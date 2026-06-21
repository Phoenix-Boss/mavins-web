// src/services/deeplink/deeplink.service.ts
import { generateDeeplink, generatePlayDeeplink, generateActivateDeeplink, generateTaskDeeplink } from '@/lib/deeplink/generator';
import { validateDeeplink } from '@/lib/deeplink/validator';
import type { DeeplinkParams, ValidationResult } from '@/lib/deeplink/validator';

class DeeplinkService {
  private readonly ANDROID_PACKAGE = 'com.soundwave.app';
  private readonly PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.soundwave.app';
  
  async openDeeplink(url: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      window.location.href = url;
      
      const timeout = setTimeout(() => {
        this.redirectToPlayStore();
      }, 2500);
      
      window.addEventListener('blur', () => {
        clearTimeout(timeout);
      });
      
      return true;
    } catch (error) {
      this.redirectToPlayStore();
      return false;
    }
  }
  
  private redirectToPlayStore(): void {
    window.location.href = this.PLAY_STORE_URL;
  }
  
  async playTrack(trackId: string, userId: string, taskId?: string): Promise<boolean> {
    const deeplink = generatePlayDeeplink(trackId, userId, taskId);
    return this.openDeeplink(deeplink);
  }
  
  async activateAccount(userId: string): Promise<boolean> {
    const deeplink = generateActivateDeeplink(userId);
    return this.openDeeplink(deeplink);
  }
  
  async completeTask(taskId: string, trackId: string, userId: string): Promise<boolean> {
    const deeplink = generateTaskDeeplink(taskId, trackId, userId);
    return this.openDeeplink(deeplink);
  }
  
  async checkAppInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 2000);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'soundwave://ping';
      
      window.addEventListener('message', (event) => {
        if (event.data === 'pong') {
          clearTimeout(timeout);
          resolve(true);
        }
      });
      
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    });
  }
  
  getPlayStoreUrl(): string {
    return this.PLAY_STORE_URL;
  }
  
  validateDeeplinkParams(params: DeeplinkParams): ValidationResult {
    return validateDeeplink(params);
  }
}

export const deeplinkService = new DeeplinkService();
