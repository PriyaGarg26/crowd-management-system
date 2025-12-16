import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LayoutService } from '../../layout/layout.service'
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs'

type EntryExitRecord = {
  entryUtc: string;
  exitUtc: string | null;
};

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './entries.html',
  styleUrls: ['./entries.component.scss']
})
export class Entries implements OnInit {

  displayedColumns = ['name', 'sex', 'entry', 'exit', 'dwellTime'];
  dataSource = new MatTableDataSource<any>([]);
  entries$!: Observable<EntryExitRecord[] | null>;
  totalCount = 0;

  pageSize = 10;
  pageIndex = 0;

  constructor(private layoutService: LayoutService, private cdr: ChangeDetectorRef) { }
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.loadEntries();
  }
  entry: any[] = []
  siteId: any
  private lastSiteId: string | null = null;

  private loadEntries(): void {
    this.layoutService.getSelectedSite$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(site => {
     
        if (this.lastSiteId !== site.siteId) {
          this.pageIndex = 0;
          this.lastSiteId = site.siteId;
          this.loadEntries();
        }
        this.fetchEntries(site.siteId);
      });
  }
  private fetchEntries(siteId: string): void {
    this.layoutService.getEntryExit({
      siteId,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.totalCount = res?.totalPages ?? 0;
        this.dataSource.data = res?.records ?? [];
        this.cdr.detectChanges()
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    const siteId = this.layoutService.getSelectedSiteId();
    this.fetchEntries(siteId);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  formatDwellTime(dwellMinutes: number | null): string {
    if (dwellMinutes == null) {
      return '--';
    }

    const totalSeconds = Math.round(dwellMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return `${mm}:${ss}`;
  }
  getInitials(name: string | null | undefined): string {
    if (!name) return ' ';

    const parts = name.trim().split(' ');

    const first = parts[0]?.charAt(0).toUpperCase() || '';
    const last = parts.length > 1
      ? parts[parts.length - 1].charAt(0).toUpperCase()
      : '';

    return first + last;
  }
  get pages(): number[] {
    return Array(Math.ceil(this.totalCount / this.pageSize));
  }

  goToPage(index: number) {
    if (index < 0) return;
    this.pageIndex = index;
    this.loadEntries();
  }
  windowSize = 4;

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalCount;
    const current = this.pageIndex + 1; // convert to 1-based

    let start = Math.max(1, current - 1);
    let end = start + this.windowSize - 1;

    if (end >= total) {
      end = total;
      start = Math.max(1, end - this.windowSize + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showLeadingEllipsis(): boolean {
    return (this.visiblePages.length && this.visiblePages[0]) > 2;
  }

  get showTrailingEllipsis(): boolean {
    const lastVisible = this.visiblePages[this.visiblePages.length - 1];
    return lastVisible < this.totalCount - 1;
  }


}
