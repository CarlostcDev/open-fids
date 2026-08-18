import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportsList } from './airports-list';

describe('AirportsList', () => {
  let component: AirportsList;
  let fixture: ComponentFixture<AirportsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportsList],
    }).compileComponents();

    fixture = TestBed.createComponent(AirportsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
