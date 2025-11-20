
export interface AppData {
  dailyCounts: { [date: string]: number };
  monthlyGoals: { [month: string]: number };
  holidays: string[];
}

// Fix: Add missing types required by the ShipmentTable component.
export enum ShipmentStatus {
  Delivered = 'Delivered',
  InTransit = 'In Transit',
  Pending = 'Pending',
  Exception = 'Exception',
}

export interface Shipment {
  id: string;
  sender: string;
  recipient: string;
  destination: string;
  status: ShipmentStatus;
  sentDate: string;
}
