import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'jhi-formly-field-rating',
  template: ` <p-rating [(ngModel)]="value" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RatingModule, FormsModule],
})
export class RatingComponent extends FieldType {
  value: number = 1;
  updateRating(value: number): void {
    this.formControl.patchValue(value);
  }
}
