import { FormControl } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'jhi-formly-field-quill-input',
  template: ` <quill-editor [formControl]="formControl" [formlyAttributes]="field"> </quill-editor> `,
  standalone: true,
  imports: [QuillModule, ReactiveFormsModule, FormlyModule],
})
export class FieldQuillTypeComponent extends FieldType {
  private _formControl: FormControl;

  constructor() {
    super();
    this._formControl = new FormControl('', {});
  }

  get formControl(): FormControl {
    return this._formControl;
  }
}
