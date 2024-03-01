// For Jest
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DataElement } from './models/data-element';
import { SettingsInterface } from './models/settingsInterface';
import { Decimal } from "decimal.js";
import { of } from "rxjs";

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
    if (typeof Worker !== 'undefined') {
      expect(component['worker']).toBeDefined();
    }
  });

  it('should initialize a worker if available', () => {
    const spy = jest.spyOn(window, 'Worker').mockImplementationOnce(() => {
      return { terminate: jest.fn() } as any;
    });
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should subscribe to form value changes on initialization', () => {
    const subscribeSpy = jest.fn();
    const spy = jest.spyOn(component['form'].valueChanges, 'pipe').mockReturnValue(of({ subscribe: subscribeSpy }));
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(subscribeSpy).toHaveBeenCalled();
  });

  describe('updateDataElements', () => {
    it('should update elementsToDisplay and apply additional_ids', () => {
      const data: DataElement[] = [
        new DataElement('1', 10, new Decimal(Math.random()).toFixed(18), '#ffffff', { id: '1001', color: '#abcdef' }),
        // ... (other elements)
      ];
      component.form.get('additional_ids')?.setValue('1,2,3');
      component['updateDataElements'](data);
      expect(component.elementsToDisplay).toEqual(data.slice(-10));
      expect(component.elementsToDisplay[0].id).toBe('1');
      // ... (other expects)
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroySubject and terminate the worker if it exists', () => {
      const workerSpy = jest.spyOn(component['worker']!, 'terminate');
      const destroySpy = jest.spyOn(component['destroySubject'], 'next');
      const completeSpy = jest.spyOn(component['destroySubject'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledTimes(1);
      if (typeof Worker !== 'undefined') {
        expect(workerSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('updateSettings', () => {
    it('should post message to worker with interval and arraySize', () => {
      if (typeof Worker !== 'undefined') {
        const workerSpy = jest.spyOn(component['worker']!, 'postMessage');
        const settings: SettingsInterface = { interval: 500, arraySize: 2000 };
        component.updateSettings(settings);
        expect(workerSpy).toHaveBeenCalledWith(settings);
      }
    });
  });

  afterEach(() => {
    if (component['worker']) {
      component['worker'].terminate();
    }
    jest.restoreAllMocks();
  });
});
