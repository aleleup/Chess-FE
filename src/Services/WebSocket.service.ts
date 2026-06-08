import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { isPlatformBrowser } from '@angular/common'; // <- Importante
import { Observable, EMPTY } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { ListenerFunction } from '../app/types';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
    private socket$!: WebSocketSubject<Object>;
    private readonly BASE_URL = 'http://localhost:7070'; 
    private WS_URL = "";
    // Conection state exposed as a signal
    public isConnected = signal<boolean>(false);
    private isBrowser: boolean;
    private listenHandler: ListenerFunction ;
    constructor() {
        // We inject the platform ID and verify if it is the browser
        this.listenHandler = (y: Object) => {}
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

        // 💡 LA SOLUCIÓN: Nos suscribimos inmediatamente para forzar la apertura del canal
        this.socket$.subscribe({
            next: (msg) => this.listenHandler(msg),
            error: (err) => console.error('Error At channel:', err)
        });

        console.log("RISING WEB SOCKET");
    }
    /**
     * Listens to the entry messages with auto-reconnect logic 
     */
    public listenMessages() { 
        this.listenHandler(this.socket$.asObservable().pipe(
        // If the stream breaks, it retries automaticaly
        catchError((error) => {
            console.error('💥 WebSocket: Critic Error after retries', error);
            return EMPTY; // Avoids the app to break, returns an empty flux
        }))
        );
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

    public setWebSockerRequirements(handler: ListenerFunction, route: string) {
        this.listenHandler = handler;
        this.WS_URL = this.BASE_URL + route;
        console.log("REQUIREMENTS COMPLETED: ", this.listenHandler, this.WS_URL);
        if (this.isBrowser) {
            this.connect();
        }
    }
}