import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { UserMindmapDetailComponent } from './user-mindmap-detail.component';

describe('UserMindmap Management Detail Component', () => {
  let comp: UserMindmapDetailComponent;
  let fixture: ComponentFixture<UserMindmapDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMindmapDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: UserMindmapDetailComponent,
              resolve: { userMindmap: () => of({ id: 'ABC' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(UserMindmapDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMindmapDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load userMindmap on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', UserMindmapDetailComponent);

      // THEN
      expect(instance.userMindmap()).toEqual(expect.objectContaining({ id: 'ABC' }));
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
