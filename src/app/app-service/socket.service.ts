import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import * as SocketIO from 'socket.io-client';
import config from './../../config';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';
import { LetterService } from './letter.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket = null;
  private events: EventEmitter = new EventEmitter();
  private socketSubject = new BehaviorSubject(
    {
      status: 'disconnected',
      // message: {
      //   type: 'danger',
      //   content: '未連線',
      // }
    }
  );

  onlineSubject = new BehaviorSubject(0);

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private letterService: LetterService
  ) {
    const { host, port } = config.Api;
  }
  get client() {
    return this.socket;
  }

  get on() {
    return this.events.on.bind(this);
  }

  get emit() {
    return this.events.emit.bind(this);
  }

  connect() {

    const { host, port } = config.ServerSocket;

    if (!this.auth.user) {
      throw Error('未登入, 無法連線');
    }

    const { id, token } = this.auth.user;
    const url = port ? `${host}:${port}/member` : `${host}/member`;
    // console.log(url, id, token);

    const socket = SocketIO(url, {
      query: { id, token },
      secure: true,
      transports: ['websocket'],
    });

    this.socket = socket;
    this.socketSubject.next({
      status: 'connecting',
      // message: {
      //   type: 'warning',
      //   content: '连线中...'
      // }
    });

    socket.on('reconnect_attempt', (times) => {
      this.socketSubject.next({
        status: 'connecting',
        // message: {
        //   type: 'warning',
        //   content: `重新连接 ... ${times}`,
        // }
      });
    });

    socket.on('reconnect_failed', () => {
      this.socketSubject.next({
        status: 'disconnected',
        // message: {
        //   type: 'danger',
        //   content: `无法连线伺服器，连线失败...`,
        // },
      });
    });

    socket.on('login-success', () => {
      this.socketSubject.next({
        status: 'connected',
        // message: {
        //   type: 'success',
        //   content: '已连线',
        // },
      });
    });

    /* 被登出 */
    socket.on('logout', () => {
      this.emit('logout');
    });

    socket.on('disconnect', () => {
      // const data = SocketNode.get();
      // const message =
      //   data.message.type === 'danger' ? data.message : { type: 'danger', content: `伺服器斷線` };

      this.socketSubject.next({
        status: 'disconnected'
      });

      this.onlineSubject.next(0);
      this.emit('disconnect');
    });

    socket.on('error-message', (message) => {
      this.toast.error(message);
    });

    socket.on('letter/send-announcement', () => {
      this.letterService.unreads();
    });

    socket.on('online/members', (online) => {
      this.onlineSubject.next(online);
    });

  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getStatus() {
    return this.socketSubject.asObservable();
  }

  getOnline() {
    return this.onlineSubject.asObservable();
  }

}
