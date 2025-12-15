import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket!: Socket;

  // alert events
  private alertSubject = new BehaviorSubject<any>(null);
  alert$ = this.alertSubject.asObservable();

  //  live occupancy updates
  private occupancySubject = new BehaviorSubject<any>(null);
  occupancy$ = this.occupancySubject.asObservable();

  connect(siteId: string) {
    if (this.socket) return; 

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      query: { siteId }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    //  ALERT EVENT
    this.socket.on('alert-event', (data: any) => {
      console.log('Alert event:', data);
      this.alertSubject.next(data);
    });

    // LIVE OCCUPANCY EVENT
    this.socket.on('live-occupancy', (data: any) => {
      console.log('Live occupancy:', data);
      this.occupancySubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined as any;
    }
  }
}
