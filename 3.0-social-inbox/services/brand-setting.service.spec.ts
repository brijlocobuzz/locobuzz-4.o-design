import { TestBed } from '@angular/core/testing';
import { BrandSettingService } from './brand-setting.service';

describe('BrandSettingService', () => {
  let service: BrandSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrandSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
