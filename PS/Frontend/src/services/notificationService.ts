class NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    this.autoRequestPermission();
  }

  private async autoRequestPermission(): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } catch (error) {
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  showNotification(title: string, options?: NotificationOptions, duration: number = 3000): void {
    if (!this.hasPermission) {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      setTimeout(() => notification.close(), duration);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
    }
  }
  checkPermission(): boolean {
    return this.hasPermission || Notification.permission === 'granted';
  }
}

export const notificationService = new NotificationService();
export default notificationService;

