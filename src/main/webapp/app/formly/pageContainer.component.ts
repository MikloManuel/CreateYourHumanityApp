import { NgFor, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldWrapper, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { MegaMenu, MegaMenuModule } from 'primeng/megamenu';

@Component({
  selector: 'jhi-formly-wrapper-panel',
  standalone: true,
  imports: [MegaMenuModule, FormlyModule, NgFor, NgForOf, NgIf],
  template: `
    <div class="layout-container">
      <button (click)="toggleMenu()" class="menu-toggle">☰</button>
      <div class="menu-container" [class.menu-open]="isMenuOpen">
        <p-megaMenu [model]="field.templateOptions?.menuItems || []" orientation="vertical"></p-megaMenu>
      </div>
      <div class="content-container">
        <div class="page-content" *ngIf="currentPage">
          <formly-field [field]="currentPage"></formly-field>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-container {
        position: relative;
        height: 100vh;
      }
      .menu-toggle {
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1000;
      }
      .menu-container {
        position: fixed;
        top: 0;
        left: -250px;
        width: 250px;
        height: 100vh;
        background: white;
        transition: left 0.3s ease;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      }
      .menu-container.menu-open {
        left: 0;
      }
      .content-container {
        margin-left: 50px;
        padding: 20px;
      }
    `,
  ],
})
export class PageWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('megaMenu') megaMenu!: MegaMenu;

  currentPage!: FormlyFieldConfig;
  isMenuOpen = false;

  ngOnInit(): void {
    if (this.field.fieldGroup && this.field.fieldGroup.length > 0) {
      this.field.templateOptions = this.field.templateOptions ?? {};
      this.field.templateOptions.menuItems = this.generateMenuItems(this.field.fieldGroup) || [];
      this.currentPage = this.field.fieldGroup[0]; // Setzt die erste Seite als aktuelle Seite
    }
  }
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  generateMenuItems(fieldGroup: FormlyFieldConfig[]): MegaMenuItem[] {
    return fieldGroup.map(field => ({
      label: field.props?.label ?? '',
      items: field.fieldGroup ? [this.generateMenuItems(field.fieldGroup)] : undefined,
      command: () => this.selectPage(field),
    }));
  }

  generateSubMenuItems(fieldGroup: FormlyFieldConfig[]): MegaMenuItem[] {
    return fieldGroup.map(field => ({
      label: field.templateOptions?.text || '',
      command: () => this.selectPage(field),
    }));
  }

  selectPage(field: FormlyFieldConfig): void {
    this.currentPage = field;
  }

  onItemSelect(event: any): void {
    // Handle menu item selection
    console.log('Selected item:', event.item);
  }
}
