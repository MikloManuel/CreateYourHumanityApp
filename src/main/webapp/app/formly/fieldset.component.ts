import { NgFor, NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FieldWrapper, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'jhi-formly-field-fieldset',
  template: `
    <fieldset>
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <formly-field *ngFor="let f of field.fieldGroup" [field]="f"></formly-field>
    </fieldset>
  `,
  standalone: true,
  imports: [FormlyModule, NgIf, NgForOf, NgFor],
})
export class FormlyFieldFieldsetComponent extends FieldWrapper {}
