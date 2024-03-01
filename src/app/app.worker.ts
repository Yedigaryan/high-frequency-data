/// <reference lib="webworker" />
import { Decimal } from 'decimal.js';
import { DataElement } from "./models/data-element";
import { ChildInterface } from "./models/childInterface";

let thisInterval: number | null;

addEventListener('message', ({ data }): void => {
  const { interval, arraySize } = data;
  if ( thisInterval ) {
    clearInterval(thisInterval)
  }


  thisInterval = setInterval((): void => {
    const dataArray: DataElement[] = generateData(arraySize);
    postMessage(dataArray);
  }, interval) as unknown as number;
});

function generateData(size: number): DataElement[] {
  const dataArray: DataElement[] = [];

  for ( let i: number = 0; i < size; i++ ) {
    const id: string = (i + 1).toString();
    const int: number = Math.floor(Math.random() * 100);
    // const float: number = parseFloat((Math.random() * 100).toFixed(18));
    const floatDecimal: Decimal = new Decimal(Math.random());
    const floatString: string = floatDecimal.toFixed(18);
    const color: string = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const child: ChildInterface = {
      id: (i + size).toString(),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };

    // Create a DataElement object and push it to the dataArray
    dataArray.push(new DataElement(id, int, floatString, color, child));
  }

  return dataArray;
}

