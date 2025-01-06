import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'jhi-formly-field-input',
  template: `
    <input type="date" [formControl]="formControl" class="form-control" [formlyAttributes]="field" [class.is-invalid]="showError" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule],
})
export class DateInputComponent extends FieldType<FieldTypeConfig> {}
