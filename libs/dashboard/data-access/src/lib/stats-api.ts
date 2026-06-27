import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IssueStats } from '@beacon/util';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsApi {
  private readonly http = inject(HttpClient);

  get(): Observable<IssueStats> {
    return this.http.get<IssueStats>('/api/stats');
  }
}
