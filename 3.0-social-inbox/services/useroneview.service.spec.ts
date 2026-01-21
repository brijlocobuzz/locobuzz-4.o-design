import { TestBed } from '@angular/core/testing';
import { UseroneviewService } from './useroneview.service';

describe('UseroneviewService', () => {
  let service: UseroneviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseroneviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
