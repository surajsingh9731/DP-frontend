import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import axe from 'axe-core';
import type { NoticeSnapshotView, RegisterView } from '@sahmati/contracts';
import { NoticesComponent } from './notices.component';
import { Api } from '../../core/api.service';
registerLocaleData(hindiLocale);

const tenant = 'notice-test';
const url = `/api/tenants/${tenant}/notices`;
const registerUrl = `/api/tenants/${tenant}/register`;
const entry: RegisterView = {
  id: 'entry-1',
  version: 2,
  status: 'draft',
  name: 'Admissions',
  purposeEn: 'Prepare admissions',
  purposeHi: 'प्रवेश की तैयारी',
  dataCategories: ['Contact'],
  storageLocation: 'Local test',
  retentionNote: 'Review required',
  contact: 'Sample contact',
  createdAt: '2026-10-17T00:00:00Z',
  updatedAt: '2026-10-17T00:00:00Z',
  sourcePack: { id: 'education', version: 1, reviewStatus: 'unreviewed' },
};
const snapshot: NoticeSnapshotView = {
  id: 'notice-1',
  entryId: entry.id,
  entryVersion: 2,
  language: 'en',
  mode: 'local-sample',
  legalReviewStatus: 'unreviewed',
  sourcePack: entry.sourcePack,
  preview: {
    entryId: entry.id,
    version: 2,
    language: 'en',
    status: 'unreviewed-draft',
    title: 'Sample notice',
    warning: 'Unreviewed sample',
    body: 'Immutable sample text',
  },
  registerData: entry,
  submittedAt: entry.createdAt,
  submittedBy: 'sample',
  reviewVersion: 1,
  status: 'in_review',
  decisions: [],
};

describe('Internal notice review', () => {
  const routeMock = { paramMap: of(convertToParamMap({ tenantId: tenant })) };
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    routeMock.paramMap = of(convertToParamMap({ tenantId: tenant }));
    TestBed.configureTestingModule({
      imports: [NoticesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: routeMock,
        },
      ],
    });
    role('owner');
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function role(role: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Sample',
      memberships: [{ tenantId: tenant, name: 'Sample', branch: 'Branch', role }],
    });
  }
  function refresh(entries: RegisterView[] = [entry], notices: NoticeSnapshotView[] = [snapshot]) {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(registerUrl).flush(entries);
    http.expectOne(url).flush(notices);
  }
  function open() {
    const fixture = TestBed.createComponent(NoticesComponent);
    refresh();
    fixture.detectChanges();
    return fixture;
  }
  it('allows staff to submit the exact saved version and language, but not record owner actions', async () => {
    role('staff');
    const fixture = open();
    const component = fixture.componentInstance;
    component.chosenEntry.set(entry);
    component.language.setValue('hi');
    await component.submit();
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.body).toMatchObject({
      entryId: entry.id,
      entryVersion: entry.version,
      language: 'hi',
    });
    expect(request.request.body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    request.flush({ ...snapshot, language: 'hi' });
    refresh([entry], [{ ...snapshot, language: 'hi' }]);
    await component.decide('publish_sample');
    TestBed.inject(HttpTestingController).expectNone(`${url}/${snapshot.id}/decisions`);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Only an owner');
  });
  it('loads the exact linked snapshot even when it is outside the current list', () => {
    routeMock.paramMap = of(convertToParamMap({ tenantId: tenant, noticeId: 'linked-notice' }));
    const fixture = TestBed.createComponent(NoticesComponent);
    refresh();
    TestBed.inject(HttpTestingController)
      .expectOne(`${url}/linked-notice`)
      .flush({ ...snapshot, id: 'linked-notice' });
    expect(fixture.componentInstance.selected()?.id).toBe('linked-notice');
  });
  it('shows an unavailable state for an unauthorised exact link without selecting a list item', () => {
    routeMock.paramMap = of(convertToParamMap({ tenantId: tenant, noticeId: 'foreign-notice' }));
    const fixture = TestBed.createComponent(NoticesComponent);
    refresh();
    TestBed.inject(HttpTestingController)
      .expectOne(`${url}/foreign-notice`)
      .flush({}, { status: 404, statusText: 'Not found' });
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(fixture.componentInstance.notices()).toEqual([]);
    expect(fixture.componentInstance.error()).toBe('unavailable');
  });
  it('does not permit viewer submission or decisions', async () => {
    role('viewer');
    const fixture = open();
    const component = fixture.componentInstance;
    component.chosenEntry.set(entry);
    component.selected.set(snapshot);
    component.acknowledged.setValue(true);
    await component.submit();
    await component.decide('publish_sample');
    TestBed.inject(HttpTestingController).expectNone((request) => request.method !== 'GET');
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
  });
  it('requires sample acknowledgement for publication and a comment for requested changes', async () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.selected.set(snapshot);
    await component.decide('publish_sample');
    expect(component.error()).toBe('acknowledgementRequired');
    await component.decide('request_changes');
    expect(component.error()).toBe('commentRequired');
    TestBed.inject(HttpTestingController).expectNone(`${url}/${snapshot.id}/decisions`);
    component.acknowledged.setValue(true);
    await component.decide('publish_sample');
    const request = TestBed.inject(HttpTestingController).expectOne(
      `${url}/${snapshot.id}/decisions`,
    );
    expect(request.request.body).toMatchObject({
      version: 1,
      decision: 'publish_sample',
      sampleOnlyAcknowledged: true,
    });
    request.flush({ ...snapshot, reviewVersion: 2, status: 'sample_published' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Local samples only');
    expect(fixture.nativeElement.textContent).toContain('Sample published · internal only');
    expect(fixture.nativeElement.textContent).toContain('Local sample · legally unreviewed');
  });
  it('offers authenticated sample exports only to owners of published local samples', () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.selected.set({ ...snapshot, status: 'sample_published' });
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.notice-exports a');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe(`${url}/${snapshot.id}/export.pdf`);
    expect(links[1].getAttribute('href')).toBe(`${url}/${snapshot.id}/qr.png`);
    expect(fixture.nativeElement.textContent).toContain('127.0.0.1');
    expect(fixture.nativeElement.textContent).toContain('requires sign-in');
    for (const access of ['staff', 'viewer'] as const) {
      role(access);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.notice-exports')).toBeNull();
    }
    role('owner');
    component.selected.set(snapshot);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notice-exports')).toBeNull();
  });
  it('reuses submission tokens across uncertain responses and recreation but changes the key for changed payloads', async () => {
    const first = open();
    first.componentInstance.chosenEntry.set(entry);
    await first.componentInstance.submit();
    const initial = TestBed.inject(HttpTestingController).expectOne(url);
    const key = initial.request.body.idempotencyKey;
    initial.flush({}, { status: 503, statusText: 'Unavailable' });
    first.destroy();
    const resumed = open();
    resumed.componentInstance.chosenEntry.set(entry);
    await resumed.componentInstance.submit();
    const retry = TestBed.inject(HttpTestingController).expectOne(url);
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush({}, { status: 503, statusText: 'Unavailable' });
    resumed.componentInstance.language.setValue('hi');
    await resumed.componentInstance.submit();
    const changed = TestBed.inject(HttpTestingController).expectOne(url);
    expect(changed.request.body.idempotencyKey).not.toBe(key);
    changed.flush(snapshot);
    refresh();
  });
  it('retains decision comments and acknowledgement through conflict and refreshes server state', async () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.selected.set(snapshot);
    component.comment.setValue('Keep this correction');
    component.acknowledged.setValue(true);
    await component.decide('request_changes');
    TestBed.inject(HttpTestingController)
      .expectOne(`${url}/${snapshot.id}/decisions`)
      .flush({}, { status: 409, statusText: 'Conflict' });
    refresh([entry], [{ ...snapshot, reviewVersion: 2, status: 'changes_requested' }]);
    expect(component.comment.value).toBe('Keep this correction');
    expect(component.acknowledged.value).toBe(true);
    expect(component.selected()?.reviewVersion).toBe(2);
    expect(component.error()).toBe('conflict');
    expect(component.canDecide()).toBe(false);
  });
  it('pins the stale chosen register version during refresh until the user selects a current version', async () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.chosenEntry.set(entry);
    await component.submit();
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush({}, { status: 409, statusText: 'Conflict' });
    refresh([{ ...entry, version: 3 }]);
    fixture.detectChanges();
    expect(component.chosenEntry()?.version).toBe(2);
    expect(component.previousSelection()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Previous selection');
  });
  it('reuses a decision key on retry and changes it when the comment changes', async () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.selected.set(snapshot);
    component.comment.setValue('Correction one');
    await component.decide('request_changes');
    const first = TestBed.inject(HttpTestingController).expectOne(
      `${url}/${snapshot.id}/decisions`,
    );
    const key = first.request.body.idempotencyKey;
    first.flush({}, { status: 503, statusText: 'Unavailable' });
    await component.decide('request_changes');
    const retry = TestBed.inject(HttpTestingController).expectOne(
      `${url}/${snapshot.id}/decisions`,
    );
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush({}, { status: 503, statusText: 'Unavailable' });
    component.comment.setValue('Correction two');
    await component.decide('request_changes');
    const changed = TestBed.inject(HttpTestingController).expectOne(
      `${url}/${snapshot.id}/decisions`,
    );
    expect(changed.request.body.idempotencyKey).not.toBe(key);
    changed.flush({ ...snapshot, status: 'changes_requested' });
  });
  for (const locale of ['en', 'hi'] as const) {
    it(`keeps snapshot language immutable and has no detected axe structural violations in ${locale}`, async () => {
      const fixture = open();
      const component = fixture.componentInstance;
      component.selected.set(snapshot);
      component.i.locale.set(locale);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.notice-snapshot').getAttribute('lang')).toBe(
        'en',
      );
      if (locale === 'hi')
        expect(fixture.nativeElement.textContent).toContain('आंतरिक नोटिस समीक्षा');
      const result = await axe.run(fixture.nativeElement, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(
        result.violations.map((value) => ({
          id: value.id,
          targets: value.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    });
  }
  it('requires explicit reviewed preparation versions and pins them in the submitted payload', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    component.chosenEntry.set(entry);
    component.usePreparation.setValue(true);
    await component.submit();
    expect(component.error()).toBe('preparationInvalid');
    component.loadPreparation();
    const template = {
      id: 'template-1',
      kind: 'template',
      version: 3,
      status: 'internally_reviewed',
      data: {
        title: 'Reviewed sample',
        body: 'Sample body',
        language: 'en',
        sourceKind: 'education-sample',
      },
      sourcePack: entry.sourcePack,
    };
    const contact = {
      id: 'contact-1',
      kind: 'contact',
      version: 5,
      status: 'internally_reviewed',
      data: { displayName: 'Synthetic team', email: 'owner@demo.sahmati.test' },
    };
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/tenants/${tenant}/preparation`)
      .flush([template, contact, { ...template, id: 'draft', status: 'draft' }]);
    expect(component.readyTemplates().map((row) => row.id)).toEqual(['template-1']);
    component.templateChoice.setValue('template-1');
    component.contactChoice.setValue('contact-1');
    await component.submit();
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.body.preparation).toEqual({
      templateId: 'template-1',
      templateVersion: 3,
      contactId: 'contact-1',
      contactVersion: 5,
    });
    request.flush({
      ...snapshot,
      preparationSource: {
        ...request.request.body.preparation,
        reviewScope: 'internal-only',
        legalReviewStatus: 'unreviewed',
        contactVerification: 'unverified',
      },
    });
    refresh();
  });
  it('does not silently reuse a preparation template after changing the snapshot language', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    component.chosenEntry.set(entry);
    component.usePreparation.setValue(true);
    component.loadPreparation();
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/tenants/${tenant}/preparation`)
      .flush([
        {
          id: 'en-only',
          kind: 'template',
          version: 3,
          status: 'internally_reviewed',
          data: { language: 'en' },
        },
      ]);
    expect(component.readyTemplates().length).toBe(1);
    component.language.setValue('hi');
    fixture.detectChanges();
    expect(component.readyTemplates().length).toBe(0);
    await component.submit();
    expect(component.error()).toBe('preparationInvalid');
    TestBed.inject(HttpTestingController).expectNone((request) => request.method === 'POST');
  });
  it('keeps the visibly selected register synchronized after a successful submit refresh', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    const select = fixture.nativeElement.querySelector('#notice-entry') as HTMLSelectElement;
    select.value = component.entryKey(entry);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await component.submit();
    TestBed.inject(HttpTestingController).expectOne(url).flush(snapshot);
    fixture.detectChanges(); // Render the loading state, which replaces the submit form.
    refresh([{ ...entry }], [snapshot]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.chosenEntry()?.id).toBe(entry.id);
    expect((fixture.nativeElement.querySelector('#notice-entry') as HTMLSelectElement).value).toBe(
      component.entryKey(entry),
    );
  });
});
