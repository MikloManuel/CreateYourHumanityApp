import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig, FieldWrapper } from '@ngx-formly/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'jhi-formly-wrapper-expansion',
  template: `
    <mat-expansion-panel id="{{ myId }}" hideToggle class="form-field-box">
      <mat-expansion-panel-header style="background-color:{{ bgColor }}; color:{{ color }}">
        <mat-panel-title>
          <h3 class="title" [style]="margin">{{ to.label }}</h3>
        </mat-panel-title>
      </mat-expansion-panel-header>

      <ng-container #fieldComponent></ng-container>
    </mat-expansion-panel>
  `,
  standalone: true,
  imports: [MatExpansionModule, MatFormFieldModule, MatInputModule],
})
export class ExpansionPanelWrapperComponent extends FieldWrapper implements OnInit {
  expanded = true;
  style = 'display: none';
  margin = 'margin-top: 4px; margin-bottom: 4px;';
  bgColor: string = 'white';
  color: string = 'black';
  myId: string | undefined = '';

  constructor() {
    super();
    // this.bgColor = this.field.templateOptions;
  }
  ngOnInit(): void {
    this.bgColor = this.field.props?.bgColor as string;
    this.color = this.field.props?.color as string;
    this.myId = this.field.id;
  }

  setExpanded(): void {}
}
