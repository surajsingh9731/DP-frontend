import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type { PreparationRecordView } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { PreparationComponent } from './preparation.component';
registerLocaleData(hindiLocale);
const tenant = 'preparation-test',
  path = `/api/tenants/${tenant}/preparation`;
const record: PreparationRecordView = {
  id: 'record-one',
  kind: 'template',
  version: 1,
  status: 'draft',
  data: {
    title: 'Synthetic title',
    body: 'Synthetic introduction',
    language: 'en',
    sourceKind: 'custom-draft',
  },
  legalReviewStatus: 'unreviewed',
  contactVerification: 'unverified',
  contentHash: 'a'.repeat(64),
  updatedAt: '2026-10-17T00:00:00Z',
  history: [],
};
describe('Template and contact readiness', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant }));
    TestBed.configureTestingModule({
      imports: [PreparationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    role('owner');
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function role(selected: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Sample',
      memberships: [{ tenantId: tenant, name: 'Synthetic', branch: 'Branch', role: selected }],
    });
  }
  function open() {
    const fixture = TestBed.createComponent(PreparationComponent);
    TestBed.inject(HttpTestingController).expectOne(path).flush([record]);
    fixture.detectChanges();
    return fixture;
  }
  function select(fixture: ReturnType<typeof open>, value = record) {
    fixture.componentInstance.select(value);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(path).flush([value]);
    http.expectOne(`${path}/${value.id}`).flush(value);
    fixture.detectChanges();
  }
  it('creates an owner template and refreshes the current server state after a command receipt', async () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    component.template.setValue(
      record.data as { title: string; body: string; language: 'en'; sourceKind: 'custom-draft' },
    );
    await component.save();
    const request = http.expectOne(`${path}/templates`);
    expect(request.request.body).toMatchObject({ ...record.data, version: 0 });
    expect(request.request.body.idempotencyKey).toMatch(/^[a-f0-9-]{36}$/);
    request.flush(record);
    http.expectOne(path).flush([{ ...record, version: 3, status: 'internally_reviewed' }]);
    http
      .expectOne(`${path}/${record.id}`)
      .flush({ ...record, version: 3, status: 'internally_reviewed' });
    expect(component.selected()?.version).toBe(3);
    expect(component.selected()?.legalReviewStatus).toBe('unreviewed');
  });
  it('preserves unsaved input and the same key after an uncertain network failure', async () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    component.template.setValue(
      record.data as { title: string; body: string; language: 'en'; sourceKind: 'custom-draft' },
    );
    await component.save();
    const first = http.expectOne(`${path}/templates`),
      key = first.request.body.idempotencyKey;
    first.flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.template.controls.body.value).toBe('Synthetic introduction');
    await component.save();
    const retry = http.expectOne(`${path}/templates`);
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush({}, { status: 503, statusText: 'Unavailable' });
  });
  it('requires comment, acknowledgement and a saved version before an owner review action', async () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    select(fixture, { ...record, status: 'in_review', version: 2 });
    await component.act('review_internal');
    expect(component.error()).toBe('commentRequired');
    component.comment.setValue('Internal only');
    await component.act('review_internal');
    expect(component.error()).toBe('ackRequired');
    component.acknowledged.setValue(true);
    component.template.markAsDirty();
    await component.act('review_internal');
    expect(component.error()).toBe('unsaved');
    component.template.markAsPristine();
    await component.act('review_internal');
    const request = http.expectOne(`${path}/${record.id}/actions`);
    expect(request.request.body).toMatchObject({
      version: 2,
      action: 'review_internal',
      comment: 'Internal only',
      internalOnlyAcknowledged: true,
    });
    request.flush({ ...record, version: 3, status: 'internally_reviewed' });
    http.expectOne(path).flush([{ ...record, version: 3, status: 'internally_reviewed' }]);
    http
      .expectOne(`${path}/${record.id}`)
      .flush({ ...record, version: 3, status: 'internally_reviewed' });
  });
  it('keeps edited content and stale version visible after a conflict while refreshing the list', async () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    select(fixture);
    component.template.controls.body.setValue('Unsaved correction');
    await component.save();
    http
      .expectOne(`${path}/templates/${record.id}`)
      .flush({}, { status: 409, statusText: 'Conflict' });
    http.expectOne(path).flush([{ ...record, version: 2 }]);
    expect(component.template.controls.body.value).toBe('Unsaved correction');
    expect(component.selected()?.version).toBe(1);
    expect(component.error()).toBe('conflict');
  });
  it('prevents staff contact edits and owner decisions and prevents viewer mutations', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    role('staff');
    select(fixture, {
      ...record,
      kind: 'contact',
      data: { displayName: 'Synthetic team', email: 'owner@demo.sahmati.test' },
      status: 'in_review',
    });
    await component.save();
    await component.act('review_internal');
    expect(component.canEdit()).toBe(false);
    fixture.detectChanges();
    const newTemplate = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'New template',
    ) as HTMLButtonElement;
    expect(newTemplate.disabled).toBe(false);
    role('viewer');
    component.newDraft('template');
    await component.save();
    TestBed.inject(HttpTestingController).expectNone((request) => request.method !== 'GET');
  });
  it('ignores an old tenant response when navigating to another tenant', () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    component.load();
    const old = http.expectOne(path);
    params.next(convertToParamMap({ tenantId: 'other-tenant' }));
    http.expectOne('/api/tenants/other-tenant/preparation').flush([]);
    old.flush([record]);
    expect(component.records()).toEqual([]);
    expect(component.selected()).toBeNull();
  });
  it('renders Hindi labels, explicit unreviewed/unverified states and labelled forms', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    select(fixture);
    component.i.locale.set('hi');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('कानूनी स्थिति: समीक्षा बाकी');
    expect(fixture.nativeElement.querySelector('#preparation-body').getAttribute('lang')).toBe(
      'en',
    );
    expect(fixture.nativeElement.textContent).toContain('संपर्क स्वामित्व: सत्यापित नहीं');
    const result = await axe.run(fixture.nativeElement, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
