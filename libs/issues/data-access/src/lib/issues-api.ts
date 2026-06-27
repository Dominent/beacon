import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Issue, IssueFilter, User } from '@beacon/util';
import { Observable } from 'rxjs';

/** Thin HTTP client. Root-relative URLs — the base-url interceptor makes them absolute. */
@Injectable({ providedIn: 'root' })
export class IssuesApi {
  private readonly http = inject(HttpClient);

  list(filter: IssueFilter): Observable<Issue[]> {
    let params = new HttpParams();
    if (filter.search) {
      params = params.set('search', filter.search);
    }
    for (const status of filter.statuses) {
      params = params.append('status', status);
    }
    for (const priority of filter.priorities) {
      params = params.append('priority', priority);
    }
    if (filter.assigneeId) {
      params = params.set('assigneeId', filter.assigneeId);
    }
    return this.http.get<Issue[]>('/api/issues', { params });
  }

  get(id: string): Observable<Issue> {
    return this.http.get<Issue>(`/api/issues/${id}`);
  }

  patch(id: string, changes: Partial<Issue>): Observable<Issue> {
    return this.http.patch<Issue>(`/api/issues/${id}`, changes);
  }

  users(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
