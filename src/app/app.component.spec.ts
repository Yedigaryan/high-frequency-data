// For Karma.js
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DataElement } from './models/data-element';
import { SettingsInterface } from './models/settingsInterface';
import { Decimal } from "decimal.js";
import { Subject } from 'rxjs';


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ ReactiveFormsModule ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize worker if Worker is defined', () => {
    if ( typeof Worker !== 'undefined' ) {
      expect(component['worker']).toBeDefined();
    }
  });

  it('should initialize a worker if available', () => {
    const spy = spyOn(window, 'Worker').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should subscribe to form value changes on initialization', () => {
    const spy = spyOn(component['form'].valueChanges, 'pipe').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  describe('updateDataElements', () => {
    it('should update elementsToDisplay and apply additional_ids', () => {
      const data: DataElement[] = [
        new DataElement('1', 10, new Decimal(Math.random()).toFixed(18), '#ffffff', { id: '1001', color: '#abcdef' }),
        new DataElement('2', 20, new Decimal(Math.random()).toFixed(18), '#abcdef', { id: '1002', color: '#ffffff' }),
        new DataElement('3', 30, new Decimal(Math.random()).toFixed(18), '#aabbcc', { id: '1003', color: '#ffeedd' }),
      ];
      component.form.get('additional_ids')?.setValue('1,2,3');
      component['updateDataElements'](data);
      console.log('data', data)
      expect(component.elementsToDisplay).toEqual(data.slice(-10));
      expect(component.elementsToDisplay[0].id).toBe('1');
      expect(component.elementsToDisplay[1].id).toBe('2');
      expect(component.elementsToDisplay[2].id).toBe('3');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroySubject and terminate the worker if it exists', () => {
      // Arrange
      const workerSpy = spyOn(component['worker']!, 'terminate');
      const destroySpy = spyOn(component['destroySubject'], 'next');
      const completeSpy = spyOn(component['destroySubject'], 'complete');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledTimes(1);
      if (typeof Worker !== 'undefined') {
        expect(workerSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('updateSettings', () => {
    it('should post message to worker with interval and arraySize', () => {
      if ( typeof Worker !== 'undefined' ) {
        const workerSpy = spyOn(component['worker']!, 'postMessage');
        const settings: SettingsInterface = { interval: 500, arraySize: 2000 };
        component.updateSettings(settings);
        expect(workerSpy).toHaveBeenCalledWith(settings);
      }
    });
  });

  afterEach(() => {
    if ( component['worker'] ) {
      component['worker'].terminate();
    }
  });
});
