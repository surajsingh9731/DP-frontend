import { registerLocaleData } from '@angular/common';
import hindi from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import axe from 'axe-core';
import { Api } from '../../core/api.service';
import { I18n } from '../../core/i18n.service';
import { WorkspaceComponent } from './workspace.component';
import type { WorkspaceView } from '@sahmati/contracts';
registerLocaleData(hindi);
const data: WorkspaceView = {
  name: 'Synthetic workspace',
  role: 'owner',
  tasks: [
    {
      id: 'task',
      template: 'review_inventory',
      status: 'open',
      assignee: 'Demo colleague',
      version: 1,
      createdAt: '2026-10-17T06:00:00.000Z',
    },
  ],
  evidence: [
    {
      id: 'event',
      taskId: 'task',
      action: 'task.created',
      occurredAt: '2026-10-17T06:00:00.000Z',
      eventHash: 'abc',
      sequence: '1',
    },
  ],
  deliveries: { pending: 1, sent: 0, failed: 0 },
};
describe('Workspace UI permissions and structure', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  for (const role of ['owner', 'viewer'] as const) {
    it(`renders ${role} controls with no detected axe A/AA structural violations`, async () => {
      const api = {
        session: signal({
          displayName: 'Demo',
          memberships: [{ tenantId: 'tenant', name: 'Synthetic workspace', branch: 'Main', role }],
        }),
        summary: () => of({ ...data, role }),
      };
      TestBed.configureTestingModule({
        imports: [WorkspaceComponent],
        providers: [
          provideRouter([]),
          { provide: Api, useValue: api },
          {
            provide: ActivatedRoute,
            useValue: { paramMap: of(convertToParamMap({ tenantId: 'tenant' })) },
          },
        ],
      });
      const fixture = TestBed.createComponent(WorkspaceComponent);
      TestBed.inject(I18n).locale.set('hi');
      fixture.detectChanges();
      await fixture.whenStable();
      const buttons = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ).map((b) => b.textContent?.trim());
      expect(buttons.includes('सेटअप काम बनाएँ')).toBe(role === 'owner');
      expect(buttons.includes('समीक्षा दर्ज करें')).toBe(role === 'owner');
      const result = await axe.run(fixture.nativeElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(result.violations.map((v) => v.id)).toEqual([]);
    });
  }
});
