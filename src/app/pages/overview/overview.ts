import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { LayoutService } from '../../layout/layout.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { SocketService } from '../../core/services/socket.service';

Chart.register(...registerables);

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart: any) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';


    ctx.font = '14px Inter';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Total Crowd', chartArea.width / 2, chartArea.height / 2 - 10);


    ctx.font = 'bold 22px Inter';
    ctx.fillStyle = '#111827';
    ctx.fillText('100%', chartArea.width / 2, chartArea.height / 2 + 15);

    ctx.restore();
  }
};



type OccupancyTrend = {
  value: number;
  isPositive: boolean;
};

type DwellDisplay = {
  minutes: number;
  seconds: number;
};

type TrendDwell = {
  value: DwellDisplay;
  isPositive: boolean;
  isNeutral:boolean
};

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    AsyncPipe,
    BaseChartDirective,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss']
})
export class Overview implements OnInit {



  liveOccupancy$!: Observable<number>;
  footfall$!: Observable<number>;
  dwell$!: Observable<DwellDisplay>;

  liveOccupancyTrend$!: Observable<OccupancyTrend>;
  footFallTrend$!: Observable<OccupancyTrend>;
  dwellTrend$!: Observable<TrendDwell>;

  demographics$!: Observable<any>;
  @ViewChild('genderAnalysisChart', { read: BaseChartDirective })
genderAnalysisChart?: BaseChartDirective;



  occupancyChartData: any;



  private siteId = 'b0fa4e2a-2159-42e7-b97b-2a9d481158f6';
  private todayPayload!: any;
  private yesterdayPayload!: any;

  constructor(private layoutService: LayoutService,private socketService:SocketService) { }


  ngOnInit(): void {
    this.socketService.occupancy$.subscribe(data => {
    if (!data) return;

    this.liveOccupancy$ = new BehaviorSubject<number>(data.count);
  });
  this.socketService.alert$.subscribe(alert => {
    if (!alert) return;

    console.log(
      `ALERT: ${alert.action} in ${alert.zoneName} (${alert.severity})`
    );
  });
    this.buildDateRanges();
    this.layoutService.getSelectedSite$().subscribe(() => {
    this.rebuildPayloads();
    this.loadTodayMetrics();
    this.loadTrends();
    this.loadOccupancyChart();
    this.loadDemographics();
    })
  }
  private rebuildPayloads():void {
    const siteId = this.layoutService.getSelectedSiteId();

  this.todayPayload = {
    siteId,
    fromUtc: this.todayPayload.fromUtc,
    toUtc: this.todayPayload.toUtc,
    pageSize: 1000,
    pageNumber: 1
  };

  this.yesterdayPayload = {
    siteId,
    fromUtc: this.yesterdayPayload.fromUtc,
    toUtc: this.yesterdayPayload.toUtc,
    pageSize: 1000,
    pageNumber: 1
  };
  }

 

  private buildDateRanges(): void {
    const now = Date.now();

    const todayFrom = now - 24 * 60 * 60 * 1000;
    const todayTo = now;

    const yesterdayFrom = todayFrom - 24 * 60 * 60 * 1000;
    const yesterdayTo = todayFrom;

    this.todayPayload = {
      siteId: this.layoutService.getSelectedSiteId(),
      fromUtc: String(todayFrom),
      toUtc: String(todayTo),
      pageSize: 1000,
      pageNumber: 1
    };

    this.yesterdayPayload = {
      siteId: this.layoutService.getSelectedSiteId(),
      fromUtc: String(yesterdayFrom),
      toUtc: String(yesterdayTo),
      pageSize: 1000,
      pageNumber: 1
    };
  }

 

  private loadTodayMetrics(): void {
    this.liveOccupancy$ = this.getLiveOccupancy(this.todayPayload);
    this.footfall$ = this.getLiveFootFall(this.todayPayload);
    this.dwell$ = this.getAvgDwell(this.todayPayload);
  }



  private loadTrends(): void {
    this.liveOccupancyTrend$ = this.buildTrend(
      this.getLiveOccupancy(this.todayPayload),
      this.getLiveOccupancy(this.yesterdayPayload)
    );

    this.footFallTrend$ = this.buildTrend(
      this.getLiveFootFall(this.todayPayload),
      this.getLiveFootFall(this.yesterdayPayload)
    );

    this.dwellTrend$ = combineLatest([
      this.getAvgDwell(this.todayPayload).pipe(
        startWith({ minutes: 0, seconds: 0 })
      ),
      this.getAvgDwell(this.yesterdayPayload).pipe(
        startWith({ minutes: 0, seconds: 0 })
      )
    ]).pipe(
      map(([today, yesterday]) => {
        const todaySec = today.minutes * 60 + today.seconds;
        const yesterdaySec = yesterday.minutes * 60 + yesterday.seconds;

        const deltaSec = todaySec - yesterdaySec;

        if (!yesterdaySec) {
          return {
            value: today,
            isPositive: true,
            isNeutral: true
          };
        }

        if (Math.abs(deltaSec) < 30) {
          return {
            value: today,
            isPositive: true,
            isNeutral: true
          };
        }

        return {
          value: today,
          isPositive: deltaSec > 0,
          isNeutral: false
        };
      })
    );
  }

  private buildTrend(
    today$: Observable<number>,
    yesterday$: Observable<number>
  ): Observable<OccupancyTrend> {
    return combineLatest([today$, yesterday$]).pipe(
      map(([today, yesterday]) => {
        if (!yesterday) {
          return { value: 0, isPositive: true };
        }

        const diff = ((today - yesterday) / yesterday) * 100;
        return {
          value: Math.round(Math.abs(diff)),
          isPositive: diff >= 0
        };
      })
    );
  }

  

  private loadOccupancyChart(): void {
    this.layoutService.getOccupancyAnalytics(this.todayPayload)
      .pipe(
        map(res => {
          const buckets = res?.buckets ?? [];
          return {
            labels: buckets.map((b: any) =>
              b.local.split(' ')[1].slice(0, 5)
            ),
            data: buckets.map((b: any) => b.avg)
          };
        })
      )
      .subscribe(chart => {
        this.occupancyChartData = {
          labels: chart.labels,
          datasets: [
            {
              label: 'Occupancy',
              data: chart.data,
              borderColor: '#2A7F7D',
              backgroundColor: 'rgba(116, 229, 227, 0.29)',
              fill: true,
              tension: 0.4,
              pointRadius: 0
            }
          ]
        };
      });
  }

  

  private getLiveOccupancy(payload: any): Observable<number> {
    return this.layoutService.getEntryExit(payload).pipe(
      map(res => {
        const records = res?.records ?? [];
        return records.filter((r: any) => r.exitUtc === null).length;
      })
    );
  }

  private getLiveFootFall(payload: any): Observable<number> {
    return this.layoutService.getFootFall(payload).pipe(
      map(res => res?.footfall ?? 0)
    );
  }

  private getAvgDwell(payload: any): Observable<DwellDisplay> {
    return this.layoutService.getDwell(payload).pipe(
      map(res => {
        const total = res?.avgDwellMinutes ?? 0;
        const minutes = Math.floor(total);
        const seconds = Math.round((total - minutes) * 60);
        return { minutes, seconds };
      })
    );
  }

  private loadDemographics(): void {
    this.layoutService.getDemographics({
      siteId: this.layoutService.getSelectedSiteId(),
      fromUtc: this.todayPayload.fromUtc,
      toUtc: this.todayPayload.toUtc
    }).subscribe(resp => {
    this.buildGenderAnalysisChart(resp);
    this.buildGenderDoughnut(resp)});
    
  }



  genderChartLabels = ['Male', 'Female'];

  genderChartData = {
    datasets: [
      {
        data: [60, 40],
        backgroundColor: [
          'rgba(42, 127, 125, 0.6)',
          '#E5E7EB'
        ],
        borderWidth: 0
      }
    ]
  };

  genderChartOptions = {
    responsive:true,
    cutout: '65%',
    radius: '80%',
    plugins: {
      legend: { display: false }
    }
  };
  genderChartPlugins = [centerTextPlugin];

 
  occupancyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'IBM Plex Sans',
            size: 14,
            weight: 500
          },
          color: '#111827'
        },
        title: {
          display: true,
          text: 'Time',
          font: {
            family: 'IBM Plex Sans',
            size: 14,
            weight: 500
          },
          color: '#111827'
        }
      },
      y: {
        min: 0,
        max: 330,
        ticks: {
          stepSize: 50,
          font: {
            family: 'IBM Plex Sans',
            size: 14,
            weight: 500
          },
          color: '#111827'
        },
        border: { display: false },
        grid: {
          display: true,
          color: '#f5f6f7ff'
        },
        title: {
          display: true,
          text: 'Count',
          font: {
            family: 'IBM Plex Sans',
            size: 14,
            weight: 500
          },
          color: '#111827'
        }
      }
    }
  };

genderAnalysisData: any = {
  labels: [],
  datasets: [
    {
      label: 'Male',
      data: [],
      borderColor: '#2A7F7D',
      backgroundColor: '#98f5f399',
      fill: false,
      borderWidth:2,
      tension: 0.4,
      pointRadius: 0
    },
    {
      label: 'Female',
      data: [],
      borderColor: '#7FC6C4',
      backgroundColor: '#7FC6C499',
      borderWidth:2,
      fill: false,
      tension: 0.4,
      pointRadius: 0
    }
  ]
};
buildGenderAnalysisChart(resp: any) {
  

  const labels = resp.buckets.map((b: any) =>
    b.local.split(' ')[1].slice(0, 5)
  );

  const maleData = resp.buckets.map((b: any) => b.male);
  const femaleData = resp.buckets.map((b: any) => b.female);



  this.genderAnalysisData = {
    labels,
    datasets: [
      {
        label: 'Male',
        data: maleData,
        borderColor: '#2A7F7D',
        backgroundColor: '#98f5f399',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Female',
        data: femaleData,
        borderColor: '#7FC6C4',
        backgroundColor: '#7FC6C499',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

this.genderAnalysisChart?.update();

 
}

genderAnalysisOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio:false,
  animation:false,
  scales: {
        x: {
          
      ticks: {
      
        font: {
          family: 'IBM Plex Sans',
          size: 14,
          weight: 500
        },
        color: '#111827'
      },
      title: {
        display: true,
        text: 'Time',
        font: {
          family: 'IBM Plex Sans',
          size: 14,
          weight: 500
        },
        color: '#111827'
      }
    },
    y: {
      beginAtZero: true,
      max:100,
      ticks: {
        callback: value => value + '%',
        font: {
          family: 'IBM Plex Sans',
          size: 14,
          weight: 500
        },color:'#111827'
      },
      grid: {
        display: true,
        color: '#f5f6f7ff'
      },
      title: {
        display: true,
        text: 'Count',
        font: {
          family: 'IBM Plex Sans',
          size: 14,
          weight: 500
        },
        color: '#111827'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: false,
        pointStyle: 'circle'
      }
    }
  }
};
genderDoughnutData:any
malePercent = 0;
femalePercent = 0
buildGenderDoughnut(resp: any) {
  let maleTotal = 0;
  let femaleTotal = 0;

  resp.buckets.forEach((b: any) => {
    maleTotal += b.male;
    femaleTotal += b.female;
  });

  const count = resp.buckets.length;
  this.malePercent = +((maleTotal / (maleTotal+femaleTotal))*100).toFixed(0);
  this.femalePercent = 100 - this.malePercent;
  this.genderDoughnutData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [
          +this.malePercent,
          +this.femalePercent
        ],
        backgroundColor: [
        '#2A7F7D',
        '#7FC6C4'
      ],
      hoverBackgroundColor: [
        '#2A7F7D',
        '#7FC6C4'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
      }
    ]
  };
}
genderDoughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display:false
    }
  },
  cutout: '70%',
  radius:'80%'
};


}    
