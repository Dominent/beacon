import { TestBed } from '@angular/core/testing';
import { Issue } from '@beacon/util';
import { IssueCard } from './issue-card';

const issue: Issue = {
  id: 'i1',
  key: 'BCN-1',
  title: 'Login bug',
  description: '',
  status: 'todo',
  priority: 'high',
  assigneeId: null,
  labelIds: [],
  projectId: 'p1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  commentCount: 0,
};

describe('IssueCard', () => {
  it('renders the key, title and status label', () => {
    const fixture = TestBed.createComponent(IssueCard);
    fixture.componentRef.setInput('issue', issue);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('BCN-1');
    expect(text).toContain('Login bug');
    expect(text).toContain('To Do');
  });
});
