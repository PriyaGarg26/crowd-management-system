import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type AlertItem = {
  time: string;
  name: string;
  action: string;
  zone: string;
  severity: 'High' | 'Medium' | 'Low';
};

@Component({
  selector: 'app-alerts',
  standalone:true,
  imports:[MatIconModule,CommonModule],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.scss']
})

export class AlertsComponent {

  alerts: AlertItem[] = [
    {
      time: 'March 03 2025 10:12',
      name: 'Ahmad',
      action: 'Entered',
      zone: 'Zone A',
      severity: 'High'
    },
    {
      time: 'March 03 2025 10:12',
      name: 'Mathew',
      action: 'Entered',
      zone: 'Zone B',
      severity: 'Medium'
    },
    {
      time: 'March 03 2025 10:12',
      name: 'Rony',
      action: 'Entered',
      zone: 'Zone B',
      severity: 'Low'
    },
    {
      time: 'March 03 2025 10:12',
      name: 'Rony',
      action: 'Entered',
      zone: 'Zone B',
      severity: 'Low'
    },
    {
      time: 'March 03 2025 10:12',
      name: 'Rony',
      action: 'Entered',
      zone: 'Zone B',
      severity: 'Low'
    },
    {
      time: 'March 03 2025 10:12',
      name: 'Rony',
      action: 'Entered',
      zone: 'Zone B',
      severity: 'Low'
    }
  ];

  
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

}
