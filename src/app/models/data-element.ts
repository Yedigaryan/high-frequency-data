import { ChildInterface } from "./childInterface";

export class DataElement {
  constructor(
    public id: string,
    public int: number,
    public float: string,
    public color: string,
    public child: ChildInterface
  ) {}
}
