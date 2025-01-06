import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FormlyModule } from '@ngx-formly/core';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'jhi-formly-field-tabs',
  template: `
    <h3>{{ field.templateOptions?.label }}</h3>
    <mat-tab-group>
      <mat-tab
        *ngFor="let tab of field.fieldGroup; let i = index; let last = last"
        [label]="tab.templateOptions?.label!"
        [disabled]="i !== 0 && !isValid(field.fieldGroup![i - 1])"
      >
        <formly-field [field]="tab"></formly-field>
      </mat-tab>
    </mat-tab-group>
  `,
  standalone: true,
  imports: [MatTabsModule, FormlyModule, NgForOf],
})
export class FormlyFieldTabsComponent extends FieldType<FieldTypeConfig> {
  isValid(field: any): boolean {
    if (field.key) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return field.formControl.valid;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return field.fieldGroup ? field.fieldGroup.every((f: any) => this.isValid(f)) : true;
  }
}
