import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  standalone: true,
  imports: [FormlyModule, CommonModule],
  selector: 'jhi-formly-wrapper-colored',
  template: `
    <div [ngClass]="cssClass">
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  styles: [
    `
      $primary-light: blue;
      $secondary-light: red;
      $info: violet;

      $formly-page-bg: $primary-light;
      $formly-fieldset-bg: $secondary-light;
      $formly-input-border: $info;

      @mixin formly-page {
        background-color: $formly-page-bg;
        padding: 1rem;
        -webkit-box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
        -moz-box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
        box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
      }

      @mixin formly-fieldset {
        background-color: $formly-fieldset-bg;
        border: 1px solid $formly-input-border;
        -webkit-box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
        -moz-box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
        box-shadow: 8px 8px 24px 0px rgba(66, 68, 90, 1);
      }
      .formly-page {
        @include formly-page;
      }
      .formly-fieldset {
        @include formly-fieldset;
      }
      // Fügen Sie hier weitere Klassen für andere Typen hinzu
    `,
  ],
})
export class FormlyWrapperColoredComponent extends FieldWrapper {
  get cssClass(): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `formly-${this.field.type}`;
  }

  registerColoredWrapper(field: FormlyFieldConfig): void {
    field.wrappers = ['colored-wrapper', ...(field.wrappers ?? [])];
  }
}
