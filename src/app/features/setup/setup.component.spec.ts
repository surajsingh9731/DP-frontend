import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import axe from 'axe-core';
import type { RegisterData, SectorPackView, SetupView } from '@sahmati/contracts';
import { SetupComponent } from './setup.component';
import { Api } from '../../core/api.service';

const tenant = 'setup-test';
const url = `/api/tenants/${tenant}/setup`;
const draft: RegisterData = {
  name: 'Admissions',
  purposeEn: 'Prepare admissions',
  purposeHi: 'प्रवेश की तैयारी',
  dataCategories: ['Contact'],
  storageLocation: 'Local test',
  retentionNote: 'Review required',
  contact: 'Sample contact',
};
const packs: SectorPackView[] = [
  {
    id: 'education',
    version: 1,
    nameEn: 'Education',
    nameHi: 'शिक्षा',
    status: 'sample-draft',
    available: true,
    defaults: draft,
  },
  {
    id: 'health',
    version: 1,
    nameEn: 'Health',
    nameHi: 'स्वास्थ्य',
    status: 'planned-unreviewed',
    available: false,
    defaults: null,
  },
];
const saved: SetupView = {
  version: 2,
  organisationName: 'Learning sample',
  packId: 'education',
  packVersion: 1,
  step: 2,
  draft,
  status: 'draft',
  registerEntryId: null,
  updatedAt: '2026-10-17T00:00:00Z',
};

describe('Guided setup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [SetupComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ tenantId: tenant })) },
        },
      ],
    });
    role('owner');
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function role(role: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Sample',
      memberships: [{ tenantId: tenant, name: 'Sample', branch: 'Sample branch', role }],
    });
  }
  function open(setup: SetupView | null = saved) {
    const fixture = TestBed.createComponent(SetupComponent);
    TestBed.inject(HttpTestingController).expectOne(url).flush({ setup, packs });
    fixture.detectChanges();
    return fixture;
  }
  it('starts manually, prefills the sample and resumes the saved step after interruption', () => {
    const first = open(null);
    const component = first.componentInstance;
    component.organisation.setValue({ organisationName: 'Learning sample', packId: 'education' });
    component.save(2);
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toMatchObject({
      version: 0,
      step: 2,
      draft,
      packVersion: 1,
    });
    request.flush({ ...saved, version: 1 });
    expect(component.form.controls.purposeHi.value).toBe(draft.purposeHi);
    first.destroy();
    const resumed = open({ ...saved, version: 1 });
    expect(resumed.componentInstance.step()).toBe(2);
    expect(resumed.componentInstance.organisation.controls.organisationName.value).toBe(
      'Learning sample',
    );
    expect(resumed.componentInstance.form.controls.name.value).toBe(draft.name);
    expect(resumed.nativeElement.querySelector('textarea[lang=hi]')).not.toBeNull();
  });
  it('keeps step one draft empty, then materializes the full sample after reload before advancing', () => {
    const first = open(null);
    first.componentInstance.organisation.setValue({
      organisationName: 'Learning sample',
      packId: 'education',
    });
    first.componentInstance.save(1);
    const progress = TestBed.inject(HttpTestingController).expectOne(url);
    expect(progress.request.body).toMatchObject({ version: 0, step: 1, draft: null });
    const stepOne = { ...saved, version: 1, step: 1 as const, draft: null };
    progress.flush(stepOne);
    first.destroy();
    const resumed = open(stepOne);
    resumed.componentInstance.save(2);
    const advance = TestBed.inject(HttpTestingController).expectOne(url);
    expect(advance.request.body).toEqual({
      version: 1,
      organisationName: 'Learning sample',
      packId: 'education',
      packVersion: 1,
      step: 2,
      draft,
    });
    advance.flush({ ...saved, version: 2 });
    expect(resumed.componentInstance.step()).toBe(2);
    expect(resumed.componentInstance.form.controls.purposeHi.value).toBe(draft.purposeHi);
  });
  it('preserves custom unsaved activity text when advancing from the organisation step', () => {
    const fixture = open({ ...saved, step: 1, draft: null });
    fixture.componentInstance.form.controls.name.setValue('Custom activity');
    fixture.componentInstance.form.markAsDirty();
    fixture.componentInstance.save(2);
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.body.draft.name).toBe('Custom activity');
    request.flush({}, { status: 409, statusText: 'Conflict' });
    expect(fixture.componentInstance.form.controls.name.value).toBe('Custom activity');
  });
  it('retains unsaved input and version after conflict, with explicit discard/reload', () => {
    const fixture = open();
    const component = fixture.componentInstance;
    component.form.controls.name.setValue('Keep this unsaved text');
    component.form.markAsDirty();
    component.save(3);
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.body.version).toBe(saved.version);
    request.flush({}, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(component.form.controls.name.value).toBe('Keep this unsaved text');
    expect(component.setup()?.version).toBe(saved.version);
    expect(component.error()).toBe('conflict');
    expect(fixture.nativeElement.textContent).toContain('Discard unsaved input and reload');
    component.load();
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush({ setup: { ...saved, version: 3 }, packs });
    expect(component.form.controls.name.value).toBe(draft.name);
  });
  it('allows staff to prepare an existing draft but reserves organisation controls and completion for owners', () => {
    role('staff');
    const fixture = open();
    const component = fixture.componentInstance;
    component.save(3);
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush({ ...saved, version: 3, step: 3 });
    component.complete();
    TestBed.inject(HttpTestingController).expectNone(`${url}/complete`);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Create register draft');
    component.previous();
    component.previous();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
  });
  it('renders viewer fields read-only and sends no mutation', () => {
    role('viewer');
    const fixture = open();
    const component = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    component.save(3);
    component.complete();
    TestBed.inject(HttpTestingController).expectNone((request) => request.method !== 'GET');
  });
  it('reuses the completion token across uncertain response and recreation, then recovers completed state', () => {
    const review = { ...saved, step: 3 as const };
    const first = open(review);
    first.componentInstance.complete();
    const pending = TestBed.inject(HttpTestingController).expectOne(`${url}/complete`);
    const key = pending.request.body.idempotencyKey;
    pending.flush({}, { status: 503, statusText: 'Unavailable' });
    first.destroy();
    const resumed = open(review);
    resumed.componentInstance.complete();
    const retry = TestBed.inject(HttpTestingController).expectOne(`${url}/complete`);
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush({ ...review, version: 3, status: 'completed', registerEntryId: 'entry-1' });
    resumed.detectChanges();
    expect(resumed.nativeElement.textContent).toContain('Register draft created');
    expect(sessionStorage.length).toBe(0);
    resumed.destroy();
    const recovered = open({
      ...review,
      version: 3,
      status: 'completed',
      registerEntryId: 'entry-1',
    });
    expect(recovered.nativeElement.querySelector('a[href$="/register"]')).not.toBeNull();
    TestBed.inject(HttpTestingController).expectNone(`${url}/complete`);
  });
  for (const locale of ['en', 'hi'] as const) {
    it(`has no detected axe A/AA structural violations through all steps in ${locale}`, async () => {
      const fixture = open();
      fixture.componentInstance.i.locale.set(locale);
      for (const step of [1, 2, 3] as const) {
        fixture.componentInstance.step.set(step);
        fixture.detectChanges();
        await fixture.whenStable();
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
      }
    });
  }
});
