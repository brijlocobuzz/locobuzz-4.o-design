import { TestBed } from '@angular/core/testing';

import { AiIntentService } from './ai-intent.service';

describe('AiIntentService', () => {
  let service: AiIntentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiIntentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
