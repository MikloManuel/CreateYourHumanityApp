declare module 'heartfullmindgateways/SendRequestButtonComponent' {
  import { Component } from '@angular/core';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  import { IUser } from '../entities/user/user.model';

  @Component({
    selector: 'jhi-send-request-button',
    standalone: true,
  })
  export class SendRequestButtonComponent {
    userId: Pick<IUser, 'id'>;
    targetUserId: Pick<IUser, 'id'>;
    onSend: () => void;
  }
}
