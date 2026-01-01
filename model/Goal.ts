export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  startDate: Date;
  endDate: Date;
  stopped: boolean;
}
