import 'jasmine';
import { MindmapParserService } from 'app/mindmap-parser.service';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

describe('MindmapParserService', () => {
  let service: MindmapParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MindmapParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseXmlData', () => {
    it('should parse XML data correctly', () => {
      const xmlData = `<form-elements>...</form-elements>`;
      service.parseXmlData(xmlData);
      //expect(service.fields).toBeDefined();
      // Add more specific expectations based on your XML structure
    });
  });
  /*
  describe('parseFormElements', () => {
    it('should parse form elements correctly', () => {
      const mockElement = document.createElement('form-elements');
      // Add child elements to mockElement
      const result = service.parseFormElements(mockElement);
      expect(result).toEqual(jasmine.any(Array));
      // Add more specific expectations
    });
  });

  // Similar tests for parseTopicOrPage, parseForm, parseField, parseSelectOptions

  describe('parseSelectOptions', () => {
    it('should parse select options correctly', () => {
      const mockSelect = document.createElement('select');
      // Add option elements to mockSelect
      const result = service.parseSelectOptions(mockSelect);
      expect(result).toEqual(jasmine.any(Array));
      // Check if the array contains the expected option objects
    });
  });
  */
});
