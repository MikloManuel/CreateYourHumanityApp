import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { FormulaDataDetailComponent } from './formula-data-detail.component';

describe('FormulaData Management Detail Component', () => {
  let comp: FormulaDataDetailComponent;
  let fixture: ComponentFixture<FormulaDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaDataDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: FormulaDataDetailComponent,
              resolve: { formulaData: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(FormulaDataDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaDataDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load formulaData on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', FormulaDataDetailComponent);

      // THEN
      expect(instance.formulaData()).toEqual(expect.objectContaining({ id: 'ABC' }));
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
