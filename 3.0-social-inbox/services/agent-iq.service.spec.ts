import { TestBed } from '@angular/core/testing';

import { AgentIqService } from './agent-iq.service';

describe('AgentIqService', () => {
  let service: AgentIqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentIqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
