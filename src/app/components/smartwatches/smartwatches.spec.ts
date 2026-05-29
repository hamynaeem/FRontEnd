import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Smartwatches } from './smartwatches';

describe('Smartwatches', () => {
  let component: Smartwatches;
  let fixture: ComponentFixture<Smartwatches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Smartwatches]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Smartwatches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
