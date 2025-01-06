import '@angular/compiler';

import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ApplicationRef,
  createComponent,
  EnvironmentInjector
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'jhi-app-send-request-button-wrapper',
  template: '<div #buttonContainer></div>',
  standalone: true
})
export class SendRequestButtonWrapperComponent implements AfterViewInit {
  @ViewChild('buttonContainer', { static: true }) buttonContainer!: ElementRef;
  @Input() userId!: string;
  @Input() targetUserId!: string;
  @Output() sendRequest = new EventEmitter<void>();

  constructor(
    private environmentInjector: EnvironmentInjector,
    private applicationRef: ApplicationRef
  ) {}

  async ngAfterViewInit(): Promise<void> {
    const ButtonModule = await loadRemoteModule({
      remoteEntry: 'http://localhost:4040/remoteEntry.js',
      remoteName: 'heartfullmindgateways',
      exposedModule: './SendRequestButtonComponent'
    });

    const componentType = ButtonModule.SendRequestButtonModule.Component;
    const componentRef = createComponent(componentType, {
      environmentInjector: this.environmentInjector,
      hostElement: this.buttonContainer.nativeElement
    });

    if (componentRef.instance) {
      (componentRef.instance as any).userId = this.userId;
      (componentRef.instance as any).targetUserId = this.targetUserId;
      (componentRef.instance as any).sendRequest?.subscribe(() => this.sendRequest.emit());
    }


    // Let Angular handle the component attachment
    componentRef.hostView.detectChanges();
  }
}
