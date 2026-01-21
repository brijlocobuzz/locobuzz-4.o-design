import { TestBed } from '@angular/core/testing';
import { FootericonsService } from './footericons.service';

describe('Footericons.Service.TsService', () => {
  let service: FootericonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FootericonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
