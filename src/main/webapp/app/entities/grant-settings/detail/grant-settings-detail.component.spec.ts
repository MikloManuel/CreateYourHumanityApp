import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { GrantSettingsDetailComponent } from './grant-settings-detail.component';

describe('GrantSettings Management Detail Component', () => {
  let comp: GrantSettingsDetailComponent;
  let fixture: ComponentFixture<GrantSettingsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrantSettingsDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: GrantSettingsDetailComponent,
              resolve: { grantSettings: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(GrantSettingsDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantSettingsDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load grantSettings on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', GrantSettingsDetailComponent);

      // THEN
      expect(instance.grantSettings()).toEqual(expect.objectContaining({ id: 'ABC' }));
    });
  });

  describe('PreviousState', () => {
    it('Should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
