import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type {
  CheckDetail,
  CheckEvaluation,
  TaskEvidenceReview,
  FollowupTask,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { ChecksComponent } from './checks.component';
registerLocaleData(hindiLocale);
const tenant = 'checks-test',
  taskPath = `/api/tenants/${tenant}/followups`,
  path = `/api/tenants/${tenant}/checks/tasks/task-one`;
const task: FollowupTask = {
  id: 'task-one',
  receiptId: 'receipt-one',
  receiptHash: 'a'.repeat(64),
  sessionId: 'session-one',
  noticeId: 'notice-one',
  entryVersion: 2,
  withdrawnPurposeIds: ['purpose-one'],
  location: {
    key: 'b'.repeat(64),
    kind: 'vendor',
    name: 'Synthetic vendor',
    detail: 'Synthetic service',
    mapping: 'declared',
  },
  status: 'pending',
  version: 2,
  responsibleRole: 'owner',
  assignee: null,
  declaredBy: null,
  declaredEvidence: [],
  retentionNote: 'Unreviewed',
  updatedAt: '2026-10-17T09:00:00Z',
  mode: 'local-sample',
  applicability: 'unreviewed-candidate',
};
const review: TaskEvidenceReview = {
  id: 'review-one',
  taskId: task.id,
  version: 1,
  taskVersion: 2,
  applicability: 'applicable',
  result: 'pass',
  rationale: 'Synthetic review',
  evidenceRefs: ['sample-evidence:review'],
  reviewerId: 'sample-owner',
  reviewedAt: task.updatedAt,
  validUntil: '2026-10-17T09:01:00Z',
  provenance: 'synthetic-manual-reference',
  authenticity: 'not-authenticated',
};
const evaluation: CheckEvaluation = {
  id: 'eval-one',
  taskId: task.id,
  taskVersion: 2,
  reviewVersion: 1,
  computedAt: task.updatedAt,
  computedBy: 'sample-owner',
  checks: [
    {
      id: 'manual_assessment',
      result: 'pass',
      reason: 'manual_assessment_record',
      provenance: 'synthetic-manual-reference',
      freshness: 'current',
      references: review.evidenceRefs,
    },
  ],
  contentHash: 'c'.repeat(64),
  mode: 'local-sample',
};
const detail: CheckDetail = {
  task,
  reviews: [review],
  evaluations: [evaluation],
  freshness: 'current',
  latestEvaluationCurrent: true,
  serverTime: task.updatedAt,
};
describe('Evidence-linked local checks', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant }));
    TestBed.configureTestingModule({
      imports: [ChecksComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    role('owner');
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });
  function role(value: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Synthetic',
      memberships: [{ tenantId: tenant, name: 'Sample', branch: 'Branch', role: value }],
    });
  }
  function flush(data: CheckDetail | null = null, selectedTenant = tenant) {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`/api/tenants/${selectedTenant}/followups`).flush([data?.task ?? task]);
    if (data)
      http.expectOne(`/api/tenants/${selectedTenant}/checks/tasks/${data.task.id}`).flush(data);
  }
  async function open() {
    const fixture = TestBed.createComponent(ChecksComponent);
    flush();
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    return fixture;
  }
  async function select(fixture: Awaited<ReturnType<typeof open>>, data = detail) {
    params.next(convertToParamMap({ tenantId: tenant, taskId: data.task.id }));
    flush(data);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
  }
  function fillReview(component: ChecksComponent) {
    component.review.patchValue({
      result: 'pass',
      rationale: 'Synthetic rationale',
      references: 'sample-evidence:review',
      validForMinutes: 60,
      ack: true,
    });
  }
  it('lists direct check routes and distinguishes local computation from monitoring or certification', async () => {
    const fixture = await open();
    expect(fixture.nativeElement.textContent).toContain('No external monitoring');
    expect(
      fixture.nativeElement.querySelector(`a[href="/workspace/${tenant}/checks/${task.id}"]`),
    ).toBeTruthy();
    await select(fixture);
    expect(fixture.nativeElement.textContent).toContain('authenticity not checked');
    expect(fixture.nativeElement.textContent).toContain('Saved evaluations');
  });
  it('turns an otherwise matching evaluation stale when manual evidence expires without polling a server', async () => {
    let time = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => time);
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance;
    expect(component.current()).toBe(true);
    time = 61000;
    component.tick.update((v) => v + 1);
    fixture.detectChanges();
    expect(component.freshness()).toBe('expired');
    expect(component.current()).toBe(false);
    expect(component.shownResult('pass')).toBe('unknown');
    expect(fixture.nativeElement.textContent).toContain('Historical snapshot; re-evaluate');
    expect(fixture.nativeElement.textContent).toContain('Saved evaluation is stale');
  });
  it('keeps original historical results while a changed task displays unknown current results', async () => {
    const fixture = await open();
    await select(fixture, {
      ...detail,
      task: { ...task, version: 3 },
      freshness: 'task_changed',
      latestEvaluationCurrent: false,
    });
    expect(fixture.componentInstance.shownResult('pass')).toBe('unknown');
    expect(fixture.componentInstance.detail()?.evaluations[0]?.checks[0]?.result).toBe('pass');
    expect(fixture.nativeElement.textContent).toContain('Task changed after review');
  });
  it('requires owner acknowledgement and safe references before recording a pinned review', async () => {
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance;
    await component.saveReview();
    expect(component.error()).toBe('invalid');
    fillReview(component);
    component.review.controls.references.setValue('https://example.test/proof');
    await component.saveReview();
    expect(component.error()).toBe('invalid');
    component.review.controls.references.setValue('sample-evidence:review');
    const pending = component.saveReview(),
      request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/reviews`),
      );
    expect(request.request.body).toMatchObject({
      taskVersion: 2,
      reviewVersion: 1,
      validForMinutes: 60,
      syntheticOnlyAcknowledged: true,
      evidenceRefs: ['sample-evidence:review'],
    });
    request.flush({ ...review, version: 2 });
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flush({
      ...detail,
      reviews: [{ ...review, version: 2 }, review],
      latestEvaluationCurrent: false,
    });
    await pending;
    expect(component.status()).toBe('saved');
  });
  it('preserves review inputs and uses the same command key after an uncertain failure', async () => {
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance;
    fillReview(component);
    const first = component.saveReview(),
      http = TestBed.inject(HttpTestingController),
      request = await vi.waitFor(() => http.expectOne(`${path}/reviews`)),
      key = request.request.body.idempotencyKey;
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    await first;
    expect(component.review.controls.rationale.value).toBe('Synthetic rationale');
    const retry = component.saveReview(),
      second = await vi.waitFor(() => http.expectOne(`${path}/reviews`));
    expect(second.request.body.idempotencyKey).toBe(key);
    second.flush({}, { status: 503, statusText: 'Unavailable' });
    await retry;
  });
  it('retries one evaluation intent safely but a subsequent explicit evaluation gets a new key', async () => {
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    const first = component.evaluate(),
      request = await vi.waitFor(() => http.expectOne(`${path}/evaluations`)),
      key = request.request.body.idempotencyKey;
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    await first;
    const retry = component.evaluate(),
      second = await vi.waitFor(() => http.expectOne(`${path}/evaluations`));
    expect(second.request.body.idempotencyKey).toBe(key);
    second.flush(evaluation);
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flush(detail);
    await retry;
    const again = component.evaluate(),
      third = await vi.waitFor(() => http.expectOne(`${path}/evaluations`));
    expect(third.request.body.idempotencyKey).not.toBe(key);
    third.flush({}, { status: 503, statusText: 'Unavailable' });
    await again;
  });
  it('adds a mapped pending child while preserving residual unknown coverage and links', async () => {
    const fixture = await open(),
      unknown = {
        ...task,
        location: {
          ...task.location,
          kind: 'unmapped' as const,
          name: 'other',
          mapping: 'unknown' as const,
        },
        status: 'unknown' as const,
      };
    await select(fixture, {
      ...detail,
      task: unknown,
      reviews: [],
      evaluations: [],
      freshness: 'missing',
      latestEvaluationCurrent: false,
    });
    const component = fixture.componentInstance;
    component.mapping.patchValue({
      kind: 'digital',
      name: 'Synthetic backup',
      detail: 'Sample store',
      rationale: 'Partial mapping only',
      references: 'sample-evidence:map',
      ack: true,
    });
    const pending = component.saveMapping(),
      request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/mapping`),
      );
    expect(request.request.body).toMatchObject({
      taskVersion: 2,
      kind: 'digital',
      syntheticOnlyAcknowledged: true,
    });
    const parent = { ...unknown, version: 3, mappedTaskIds: ['child-one'] };
    request.flush({ parent, child: { ...task, id: 'child-one', status: 'pending' } });
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flush({
      ...detail,
      task: parent,
      reviews: [],
      evaluations: [],
      freshness: 'missing',
      latestEvaluationCurrent: false,
    });
    await pending;
    fixture.detectChanges();
    expect(component.detail()?.task.status).toBe('unknown');
    expect(
      fixture.nativeElement.querySelector(`a[href="/workspace/${tenant}/checks/child-one"]`),
    ).toBeTruthy();
  });
  it('unknown-paper mapping only offers paper and no false not-applicable or pass override', async () => {
    const fixture = await open();
    await select(fixture, {
      ...detail,
      task: {
        ...task,
        status: 'unknown',
        location: { ...task.location, kind: 'unmapped', name: 'paper', mapping: 'unknown' },
      },
    });
    const component = fixture.componentInstance;
    expect(component.mapping.controls.kind.value).toBe('paper');
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('#mapping-kind option')).map((o) =>
        (o as HTMLOptionElement).getAttribute('value'),
      ),
    ).toEqual(['paper']);
    expect(fixture.nativeElement.querySelector('#check-result option[value="pass"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('#check-applicability option[value="not_applicable"]'),
    ).toBeNull();
  });
  it('viewers cannot record anything and staff do not see owner evidence or mapping forms', async () => {
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance;
    role('viewer');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    await component.evaluate();
    await component.saveReview();
    role('staff');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(component.canEvaluate()).toBe(true);
  });
  it('handles stale/denied reviews without false success and ignores late results after tenant navigation', async () => {
    const fixture = await open();
    await select(fixture);
    const component = fixture.componentInstance;
    fillReview(component);
    const pending = component.saveReview(),
      request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/reviews`),
      );
    request.flush({}, { status: 409, statusText: 'Changed' });
    await pending;
    expect(component.error()).toBe('conflict');
    expect(component.status()).toBe('');
    const loading = component.load();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(taskPath).flush([task]);
    const old = http.expectOne(path);
    params.next(convertToParamMap({ tenantId: 'other' }));
    flush(null, 'other');
    old.flush(detail);
    await loading;
    expect(component.detail()).toBeNull();
  });
  it('actual review form submission prevents native navigation and renders references as labels only', async () => {
    const fixture = await open();
    await select(fixture);
    fillReview(fixture.componentInstance);
    const event = new Event('submit', { bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector('form').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/reviews`),
    );
    request.flush({}, { status: 400, statusText: 'Invalid' });
    await vi.waitFor(() => expect(fixture.componentInstance.busy()).toBe(false));
    expect(fixture.nativeElement.querySelector('code')?.textContent).toBe('sample-evidence:review');
    expect(fixture.nativeElement.querySelector('a[href^="sample-evidence"]')).toBeNull();
  });
  it('English and Hindi checks/reviews/mapping have no automated structural accessibility violations', async () => {
    const fixture = await open();
    await select(fixture);
    for (const language of ['en', 'hi'] as const) {
      fixture.componentInstance.i.locale.set(language);
      fixture.detectChanges();
      Array.from(fixture.nativeElement.querySelectorAll('details')).forEach((element) => {
        (element as HTMLDetailsElement).open = true;
      });
      const results = await axe.run(fixture.nativeElement, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    }
  });
});
