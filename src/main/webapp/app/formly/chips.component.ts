import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ChipModule } from 'primeng/chip';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { FormulaDataService } from 'app/entities/formula-data/service/formula-data.service';
import { IFormulaData } from 'app/entities/formula-data/formula-data.model';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import dayjs, { Dayjs } from 'dayjs/esm';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';

/**
 * @title Keyword input
 */
@Component({
  selector: 'jhi-keyword-input-example',
  template: `
    <div class="card p-fluid">
      <p-floatLabel>
        <p-chips id="chip" [(ngModel)]="values" />
        <label for="chip">Chips</label>
      </p-floatLabel>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ChipModule, FormsModule, FloatLabelModule],
})
export class ChipsComponent extends FieldType<FieldTypeConfig> {
  values: string[] | undefined;
}
