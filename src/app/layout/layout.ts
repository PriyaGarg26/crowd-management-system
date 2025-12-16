import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Topbar } from './topbar/topbar';
import { Sidebar } from './sidebar/sidebar';
import { FormBuilder } from '@angular/forms';
import { LayoutService } from './layout.service';

import { Observable, Subject} from 'rxjs';
import { PageHeader } from "./page-header/page-header";
import { SocketService } from '../core/services/socket.service';
import { AlertsComponent } from './alerts/alerts';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, Topbar, Sidebar, PageHeader,AlertsComponent,AsyncPipe,CommonModule],
  standalone:true,
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout implements OnInit,OnDestroy{
  alertsOpen$: Observable<boolean>;
  private destroyed$ = new Subject<void>();

  pageNumber = 1;
  pageSize = 10;
  siteId='b0fa4e2a-2159-42e7-b97b-2a9d481158f6'
  fromUtc=Date.now() - 24*60*60*100;
  toUtc=Date.now()
constructor(
  private layoutService:LayoutService,
  private socketService:SocketService, 
  private route:ActivatedRoute

){
  this.alertsOpen$ = this.layoutService.alertsOpen$;
}
ngOnInit(): void {
  const siteId = this.layoutService.getSelectedSiteId();
  this.socketService.connect(siteId);
  this.route.queryParams.subscribe(params => {
      if (params['showAlerts'] === 'true') {
        this.layoutService.openAlerts();
      } else {
        this.layoutService.closeAlerts();
      }
    });
}
ngOnDestroy(): void {
  this.destroyed$.next()
  this.destroyed$.complete()
}
isSidebarCollapsed=false
  
 

  // Pagination handlers (e.g., tied to paginator)
  goToPage(page: number): void {
    this.pageNumber = page;

  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    
  }
 

  closeAlerts() {
    this.layoutService.closeAlerts();
  }
}



