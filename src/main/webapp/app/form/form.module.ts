import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormContainerComponent } from './form-container/form-container.component';
import SharedModule from 'app/shared/shared.module';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyFieldTabsComponent } from 'app/formly/tabs.component';
import { FieldQuillTypeComponent } from 'app/formly/quill.component';
import { FormlyGrantsComponent } from 'app/formly/grant_controller.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RatingComponent } from 'app/formly/rating.component';
import { ChipsComponent } from 'app/formly/chips.component';
import { DateTimeInputComponent } from 'app/formly/date-time.component';
import { DateInputComponent } from 'app/formly/date.component';
import { ExpansionPanelWrapperComponent } from 'app/formly/expansionpanel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldFieldsetComponent } from 'app/formly/fieldset.component';
import { PageWrapperComponent } from 'app/formly/pageContainer.component';
import { FormlyWrapperColoredComponent } from 'app/formly/colored-wrapper.component';

@NgModule({
  // Keep non-standalone components here
  imports: [
    FormContainerComponent,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyBootstrapModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'colored-wrapper', component: FormlyWrapperColoredComponent },
        { name: 'grant', component: FormlyGrantsComponent },
        { name: 'expansion', component: ExpansionPanelWrapperComponent },
        { name: 'fieldset', component: FormlyFieldFieldsetComponent },
      ],
      types: [
        { name: 'tabs', component: FormlyFieldTabsComponent, wrappers: ['form-field', 'colored-wrapper'] },
        { name: 'quill', component: FieldQuillTypeComponent, wrappers: ['form-field'] },
        { name: 'ratings', component: RatingComponent, wrappers: ['form-field'] },
        { name: 'chips', component: ChipsComponent, wrappers: ['form-field'] },
        { name: 'time', component: DateTimeInputComponent, wrappers: ['form-field'] },
        { name: 'date', component: DateInputComponent, wrappers: ['form-field'] },
        { name: 'page', component: PageWrapperComponent },
        { name: 'tab', component: FormlyFieldTabsComponent, wrappers: ['form-field', 'colored-wrapper'] },
        {
          name: 'textfield',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'text',
            },
          },
        },
        {
          name: 'topic',
          extends: 'fieldset',
          defaultOptions: {
            templateOptions: {
              topicId: 'topicId',
            },
          },
        },
        {
          name: 'option',
          extends: 'radio',
          defaultOptions: {
            templateOptions: {
              topicId: 'topicId',
            },
          },
        },
        {
          name: 'form',
          extends: 'fieldset',
          defaultOptions: {
            templateOptions: {
              topicId: 'topicId',
            },
          },
        },
      ],
    }),
    MatFormFieldModule,
    MatSelectModule,
    // Import standalone components
    ExpansionPanelWrapperComponent,
    DateInputComponent,
    DateTimeInputComponent,
    ChipsComponent,
    RatingComponent,
    FormlyGrantsComponent,
    FieldQuillTypeComponent,
    FormlyFieldTabsComponent,
  ],
  exports: [
    FormContainerComponent,
    // Add other components here if they need to be used outside this module
  ],
})
export class FormModule {}
