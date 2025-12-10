import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;

  async startConnection(hubUrl: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) return;

    this.isConnecting = true;

    try {
      const token = localStorage.getItem('authToken');

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.onreconnecting(() => {});
      this.connection.onreconnected(() => {});
      this.connection.onclose(() => this.isConnecting = false);

      await this.connection.start();
      
    } catch (error) {
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  on(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) return;
    
    const wrappedCallback = (...args: any[]) => {
      callback(...args);
    };
    
    (callback as any).__wrappedCallback = wrappedCallback;
    
    this.connection.on(eventName, wrappedCallback);
  }

  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.connection) return;
    
    if (callback) {
      const wrappedCallback = (callback as any).__wrappedCallback;
      if (wrappedCallback) {
        this.connection.off(eventName, wrappedCallback);
      } else {
        this.connection.off(eventName, callback);
      }
    } else {
      this.connection.off(eventName);
    }
  }

  async invoke<T = any>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR: No hay conexión activa');
    }
    return await this.connection.invoke(methodName, ...args) as T;
  }

  async send(methodName: string, ...args: any[]): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR: No hay conexión activa');
    }
    await this.connection.send(methodName, ...args);
  }
}

export const signalRService = new SignalRService();
export default signalRService;

