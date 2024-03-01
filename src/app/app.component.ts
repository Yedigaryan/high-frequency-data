import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DataElement } from "./models/data-element";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { FormControl, FormGroup } from "@angular/forms";
import { SettingsInterface } from "./models/settingsInterface";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  dataElements: DataElement[] = [];
  elementsToDisplay: DataElement[] = [];
  protected destroySubject: Subject<void> = new Subject<void>();
  form: FormGroup = new FormGroup({
    interval: new FormControl(300),
    arraySize: new FormControl(1000),
    additional_ids: new FormControl([],)
  });
  protected worker: Worker | undefined;

  constructor(private readonly cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.initializeWorker();
    this.subscribeToFormChanges();
  }

  public trackByFunction(index: number, element: DataElement): string {
    return element.id;
  }

  protected initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./app.worker', import.meta.url), { type: 'module' });
      this.worker.onmessage = ({ data }) => this.updateDataElements(data);
    }
  }

  protected subscribeToFormChanges(): void {
    this.form.valueChanges.pipe(
      takeUntil(this.destroySubject),
      debounceTime(500)
    ).subscribe(() => this.updateSettings(this.form.value));
  }

  protected updateDataElements(data: DataElement[]): void {
    this.dataElements = data;
    this.elementsToDisplay = this.sliceLastTenElements(data);

    const additional_ids_value = this.form.get('additional_ids')?.value;
    const additional_ids: string[] = this.parseAdditionalIds(additional_ids_value);

    if (additional_ids.length > 0) {
      this.elementsToDisplay = this.updateElementsIds(this.elementsToDisplay, additional_ids);
    }
    this.cdr.markForCheck();
  }

  protected sliceLastTenElements(data: DataElement[]): DataElement[] {
    return data.slice(-10);
  }

  protected parseAdditionalIds(additionalIdsValue: any): string[] {
    return typeof additionalIdsValue === 'string' && additionalIdsValue !== ''
      ? additionalIdsValue.split(',').map((id: string) => id.trim()).filter(id => id)
      : [];
  }

  protected updateElementsIds(elementsToDisplay: DataElement[], additionalIds: string[]): DataElement[] {
    return elementsToDisplay.map((element, index) => {
      if (index < additionalIds.length && !isNaN(Number(additionalIds[index]))) {
        return { ...element, id: additionalIds[index] };
      }
      return element;
    });
  }


  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.worker?.terminate();
  }

  public updateSettings(values: SettingsInterface): void {
    if ( this.worker ) {
      this.worker.postMessage({ interval: values.interval, arraySize: values.arraySize });
    }
  }

}
