import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef, signal, inject } from '@angular/core';
import { FieldType, FieldTypeConfig, FieldWrapper } from '@ngx-formly/core';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { IGrantSettings } from 'app/entities/grant-settings/grant-settings.model';
import { GrantSettingsService } from 'app/entities/grant-settings/service/grant-settings.service';
import { Grants } from 'app/form/grant-system/grants.constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { IUser } from 'app/entities/user/user.model';

@Component({
  selector: 'jhi-formly-wrapper-expansion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3 class="card-label-header">{{ to.label }}</h3>
    <div class="card-body">
      <ng-container #fieldComponent></ng-container>
    </div>
    <hr />
    <div class="form-field-label">Viewing permissions:</div>
    <mat-form-field>
      <mat-label>Permission</mat-label>
      <mat-select [(value)]="selectedGrant" (selectionChange)="onGrantSelectionChange(field.id!, selectedGrant)">
        <mat-option *ngFor="let grant of grantOptions" [value]="grant">
          {{ grant }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
})
export class FormlyGrantsComponent extends FieldWrapper implements OnInit {
  grantOptions = Object.values(Grants);
  selectedGrant!: Grants;
  account = signal<Account | null>(null);
  grantsLevel!: IGrantSettings;
  accountService = inject(AccountService);

  constructor(
    private cdr: ChangeDetectorRef,
    private grantSettingsService: GrantSettingsService,
  ) {
    super();
  }

  onGrantSelectionChange(fieldId: string, grant: Grants): void {
    const grantsMap = JSON.parse(this.grantsLevel.grantMap!);
    grantsMap[Number(fieldId)] = grant;
    this.grantSettingsService
      .update({
        id: this.grantsLevel.id,
        grantMap: JSON.stringify(grantsMap),
      })
      .subscribe(() => {
        this.grantsLevel.grantMap = JSON.stringify(grantsMap);
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      this.account.set(account);
      if (account) {
        const userLogin = account.login;
        this.grantSettingsService.query({ 'userLogin.equals': userLogin }).subscribe(data => {
          this.grantsLevel = data.body?.find(
            grant => grant.user?.login === account.login
          ) ?? {
            id: '',
            grantMap: '{}',
            user: { id: '', login: account.login },
          };
          const grantsMap = JSON.parse(this.grantsLevel.grantMap ?? '{}');
          this.selectedGrant = grantsMap[Number(this.field.id)] || Grants.NONE;
          this.cdr.markForCheck();
        });
      }
    });
  }

}
