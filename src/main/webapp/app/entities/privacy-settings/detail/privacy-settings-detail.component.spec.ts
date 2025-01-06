import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PrivacySettingsDetailComponent } from './privacy-settings-detail.component';

describe('PrivacySettings Management Detail Component', () => {
  let comp: PrivacySettingsDetailComponent;
  let fixture: ComponentFixture<PrivacySettingsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySettingsDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: PrivacySettingsDetailComponent,
              resolve: { privacySettings: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PrivacySettingsDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacySettingsDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load privacySettings on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PrivacySettingsDetailComponent);

      // THEN
      expect(instance.privacySettings()).toEqual(expect.objectContaining({ id: 'ABC' }));
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
