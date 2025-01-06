/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { MindmapParserService } from './mindmap-parser.service';

describe('Service: MindmapParser', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MindmapParserService],
    });
  });

  it('should ...', inject([MindmapParserService], (service: MindmapParserService) => {
    expect(service).toBeTruthy();
  }));
});
