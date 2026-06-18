import { Injectable, signal, inject, PLATFORM_ID, WritableSignal } from '@angular/core';import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { isPlatformBrowser } from '@angular/common'; // <- Importante
import { Observable, EMPTY, Subject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { BASE_URL } from '../enviroment.dev';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
    teamId: WritableSignal<number> | null = null
    private socket$!: WebSocketSubject<Object>;
    private WS_URL = "";
    // Conection state exposed as a signal
    public isConnected = signal<boolean>(false);
    private isBrowser: boolean;
    private messageStream$ = new Subject<any>();
    constructor() {
        // We inject the platform ID and verify if it is the browser
        const platformId = inject(PLATFORM_ID);
        this.isBrowser = isPlatformBrowser(platformId);
        
        // We only attempt to connect if we are on the client (browser)
  }

    /**
     * WebSocket Start WS config
     */
    private connect(): void {
        this.socket$ = webSocket({
            url: this.WS_URL,
            openObserver: {
                next: () => {
                    console.log('WebSocket: Connected successfully');
                    this.isConnected.set(true);
                },
            },
            closeObserver: {
                next: () => {
                    console.log('WebSocket: Connection closed');
                    this.isConnected.set(false);
                },
            },
        });

        this.socket$.subscribe({
            next: (msg) => {
                console.log("WS CONNECTED !!", msg);
                
                // MAGIC: 
                // Redirect the server message  to the public bridge
                this.messageStream$.next(msg);
            },
            error: (err) => console.error('Error At channel:', err)
        });

        console.log("RISING WEB SOCKET");
    }
    public async init(route: string) {
        this.WS_URL = BASE_URL + route;
        console.log("REQUIREMENTS COMPLETED: ", this.WS_URL);
        if (this.isBrowser) {
            this.connect();
        }
    }
    /**
     * Listens to the entry messages with auto-reconnect logic 
     */
    public listenMessages(): Observable<any> {
            return this.messageStream$.asObservable();
    }

    /**
     * Sends a safe message to the server
     */
    public sendMessage(payload: any): void {
        if (this.isConnected()) {
        this.socket$.next(payload);
        } else {
        console.warn('⚠️ Message not send');
        }
    }

    /**
     * Manual disconnection.
     */
    public disconnect(): void {
        this.socket$.complete();
    }

    
}
