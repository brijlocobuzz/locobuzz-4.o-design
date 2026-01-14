import { TestBed } from '@angular/core/testing';
import { SlasettingService } from './slasetting.service';

describe('SlasettingService', () => {
  let service: SlasettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlasettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
