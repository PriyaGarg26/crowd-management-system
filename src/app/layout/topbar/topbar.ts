import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {  MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { LayoutService } from '../layout.service';
import type { Site } from '../layout.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { filter } from 'rxjs';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatIconModule,MatFormFieldModule,MatSelectModule,ReactiveFormsModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss']
})
export class Topbar {
  constructor(private layoutService:LayoutService,private fb:FormBuilder){}
  appName = 'Crowd Management';
  siteName = 'HQ - Bangalore';
  language = 'EN';
  userName = 'Priya';
  topBarForm!:FormGroup
  ngOnInit(){
    this.inittopBarForm()
    this.loadSiteDropDown()
    
  }
  sites:any
  selectedSite:any
  loadSiteDropDown() {
this.layoutService.loadSites().subscribe();

  // subscribe to sites
  this.layoutService.getSites$().subscribe(sites => {
    this.sites = sites;
  });

  // subscribe to selected site
  this.layoutService.getSelectedSite$().subscribe(site => {
    this.selectedSite = site;
   
  });
   this.layoutService.getSelectedSite$()
      .pipe(filter(site => !!site)) 
      .subscribe(site => {
       
        
        this.topBarForm.get('selectedSite')?.patchValue(site);
      });
  }

inittopBarForm(){
this.topBarForm=this.fb.group({
  selectedSite:[null]
})
}
  onSiteChange(site: Site) {

  this.layoutService.setSelectedSite(site);
  
}
compareSitesById(s1: Site, s2: Site): boolean {
  return s1 && s2 && s1.siteId === s2.siteId;
}
onAlertsClick() {
    this.layoutService.toggleAlerts();
  }
}
