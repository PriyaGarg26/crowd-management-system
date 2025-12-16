import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, tap } from "rxjs";

export type Site = {
  siteId: string;
  name: string;
};
@Injectable({
  providedIn: 'root'
})

export class LayoutService {
  private baseUrl = '/api/analytics';

  constructor(private http: HttpClient) { }
  getEntryExit(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/entry-exit`, payload)
  }
  getDwell(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/dwell`, payload)
  
  }
  getFootFall(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/footfall`, payload)
   
  }
  getDemographics(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/demographics`, payload)
   
  }
  getOccupancyAnalytics(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/occupancy`,
      payload
    );
  }

  private sites$ = new BehaviorSubject<Site[]>([]);
  loadSites(): Observable<Site[]> {
    return this.http.get<Site[]>('/api/sites').pipe(
      tap((sites) => {
        this.sites$.next(sites);

        // auto-select first site if none selected
        if (!this.selectedSite$.value && sites.length) {
          this.selectedSite$.next(sites[0]);
        }
      })
    );
  }
  getSites$(): Observable<Site[]> {
  return this.sites$.asObservable();
}
  private selectedSite$ = new BehaviorSubject<Site>({
    siteId: '8bd0d580-fdac-44a4-a6e4-367253099c4e',
    name: 'Dubai Mall'
  });

private selectedSiteId$ = new BehaviorSubject<string>(
  '8bd0d580-fdac-44a4-a6e4-367253099c4e'
);


  getSelectedSite$(): Observable<Site> {
    return this.selectedSite$.asObservable();
  }


  getSelectedSiteId(): string {
    return this.selectedSite$.value.siteId;
  }


  setSelectedSite(site: Site): void {
    this.selectedSite$.next(site);
  }
  setSelectedSiteId(siteId: string): void {
  this.selectedSiteId$.next(siteId);
}
  private alertsOpenSubject = new BehaviorSubject<boolean>(false);
  alertsOpen$ = this.alertsOpenSubject.asObservable();

  toggleAlerts() {
    this.alertsOpenSubject.next(!this.alertsOpenSubject.value);
  }

  closeAlerts() {
    this.alertsOpenSubject.next(false);
  }

}