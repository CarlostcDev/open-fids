import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Aircraft } from './aircraft';

describe('Aircraft', () => {
  let component: Aircraft;
  let fixture: ComponentFixture<Aircraft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aircraft],
    }).compileComponents();

    fixture = TestBed.createComponent(Aircraft);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
