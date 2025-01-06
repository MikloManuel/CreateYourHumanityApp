import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { MindmapXmlDetailComponent } from './mindmap-xml-detail.component';

describe('MindmapXml Management Detail Component', () => {
  let comp: MindmapXmlDetailComponent;
  let fixture: ComponentFixture<MindmapXmlDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MindmapXmlDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: MindmapXmlDetailComponent,
              resolve: { mindmapXml: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(MindmapXmlDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MindmapXmlDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load mindmapXml on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', MindmapXmlDetailComponent);

      // THEN
      expect(instance.mindmapXml()).toEqual(expect.objectContaining({ id: 'ABC' }));
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
