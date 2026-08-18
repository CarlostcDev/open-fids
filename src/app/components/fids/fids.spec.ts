import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fids } from './fids';

describe('Fids', () => {
  let component: Fids;
  let fixture: ComponentFixture<Fids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fids],
    }).compileComponents();

    fixture = TestBed.createComponent(Fids);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
