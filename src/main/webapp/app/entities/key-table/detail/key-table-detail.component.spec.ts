import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { KeyTableDetailComponent } from './key-table-detail.component';

describe('KeyTable Management Detail Component', () => {
  let comp: KeyTableDetailComponent;
  let fixture: ComponentFixture<KeyTableDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyTableDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: KeyTableDetailComponent,
              resolve: { keyTable: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(KeyTableDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyTableDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load keyTable on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', KeyTableDetailComponent);

      // THEN
      expect(instance.keyTable()).toEqual(expect.objectContaining({ id: 'ABC' }));
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
