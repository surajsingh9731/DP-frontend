import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type { EvidencePage, EvidenceDetail } from '@sahmati/contracts';
import { EvidenceComponent } from './evidence.component';
registerLocaleData(hindiLocale);
const tenant = 'evidence-test',
  id = '00000000-0000-4000-8000-000000000001',
  path = `/api/tenants/${tenant}/evidence`;
const page: EvidencePage = {
  items: [
    {
      key: `rights:${id}:7`,
      kind: 'rights',
      id,
      sourceId: id,
      version: 7,
      at: '2026-10-17T10:00:00Z',
      action: 'close',
      status: 'closed',
      provenance: 'manual',
    },
  ],
  nextCursor: 'opaque-page',
  asOf: '2026-10-17T10:00:01Z',
  serverTime: '2026-10-17T10:00:02Z',
  searchScope: 'identifiers-and-controlled-metadata',
};
const detail: EvidenceDetail = {
  item: page.items[0]!,
  freshness: 'source_changed',
  integrity: { digest: 'match', previous: 'linked', scope: 'single-event-and-previous-reference' },
  facts: [{ label: 'remaining', value: 3 }],
  links: [
    { label: 'source', state: 'available', path: `/workspace/${tenant}/rights/${id}` },
    { label: 'notice', state: 'unavailable' },
  ],
  serverTime: page.serverTime,
  mode: 'local-sample',
};
describe('Permission-filtered evidence browsing', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>,
    query: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    localStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant }));
    query = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      imports: [EvidenceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params, queryParamMap: query } },
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });
  function list() {
    return TestBed.inject(HttpTestingController).expectOne((r) => r.url === path);
  }
  async function open(selected = false) {
    if (selected)
      params.next(convertToParamMap({ tenantId: tenant, kind: 'rights', id, version: '7' }));
    const fixture = TestBed.createComponent(EvidenceComponent);
    list().flush(page);
    if (selected)
      TestBed.inject(HttpTestingController).expectOne(`${path}/rights/${id}/7`).flush(detail);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    return fixture;
  }
  it('shows permitted metadata without pretending a matching hash is current external proof', async () => {
    const fixture = await open(true),
      text = fixture.nativeElement.textContent;
    expect(text).toContain('Source version changed since this event');
    expect(text).toContain('Local digest matches');
    expect(text).toContain('not a full-history audit');
    expect(text).toContain('Source unavailable or outside your scope');
    expect(
      fixture.nativeElement.querySelector(`a[href="/workspace/${tenant}/rights/${id}"]`),
    ).toBeTruthy();
  });
  it('applies actual search form with first-page filters and no stale cursor', async () => {
    query.next(convertToParamMap({ cursor: 'old-cursor', limit: '10' }));
    const fixture = await open(),
      component = fixture.componentInstance,
      navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.patchValue({
      q: '  request-id  ',
      kind: 'rights',
      provenance: 'manual',
      limit: 10,
    });
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(navigate).toHaveBeenCalledWith(['/workspace', tenant, 'evidence'], {
      queryParams: { q: 'request-id', kind: 'rights', provenance: 'manual', limit: 10 },
    });
  });
  it('routes the next cursor with existing filters and disables paging when exhausted', async () => {
    query.next(convertToParamMap({ kind: 'rights', limit: '10' }));
    const fixture = await open(),
      component = fixture.componentInstance,
      navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.next();
    expect(navigate).toHaveBeenCalledWith(['/workspace', tenant, 'evidence'], {
      queryParams: { kind: 'rights', limit: 10, cursor: 'opaque-page' },
    });
    component.page.set({ ...page, nextCursor: null });
    fixture.detectChanges();
    expect(
      [...fixture.nativeElement.querySelectorAll('button')].find(
        (b: Element) => b.textContent?.trim() === 'Next page',
      )?.disabled,
    ).toBe(true);
  });
  it('clears previously displayed detail when assignment/read authorization is removed', async () => {
    const fixture = await open(true),
      component = fixture.componentInstance,
      pending = component.load();
    list().flush({}, { status: 404, statusText: 'Unavailable' });
    TestBed.inject(HttpTestingController).expectOne(`${path}/rights/${id}/7`);
    await pending;
    fixture.detectChanges();
    expect(component.detail()).toBeNull();
    expect(component.page()).toBeNull();
    expect(component.error()).toBe('unavailable');
    expect(fixture.nativeElement.textContent).not.toContain(id);
  });
  it('rejects excessive search text without navigation and resets invalid paging safely', async () => {
    const fixture = await open(),
      component = fixture.componentInstance,
      navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.controls.q.setValue('x'.repeat(81));
    component.apply();
    expect(component.error()).toBe('invalid');
    expect(navigate).not.toHaveBeenCalled();
    component.reset();
    expect(navigate).toHaveBeenCalledWith(['/workspace', tenant, 'evidence'], {
      queryParams: { limit: 20 },
    });
  });
  it('discards late results from an earlier tenant scope', async () => {
    const fixture = TestBed.createComponent(EvidenceComponent),
      old = list();
    params.next(convertToParamMap({ tenantId: 'other' }));
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url === '/api/tenants/other/evidence')
      .flush({ ...page, items: [] });
    old.flush(page);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    expect(fixture.componentInstance.page()?.items).toEqual([]);
  });
  it('shows expired read-time evidence without relabelling its stored digest as a failure or successful fulfillment', async () => {
    params.next(convertToParamMap({ tenantId: tenant, kind: 'rights', id, version: '7' }));
    const fixture = TestBed.createComponent(EvidenceComponent);
    list().flush(page);
    TestBed.inject(HttpTestingController)
      .expectOne(`${path}/rights/${id}/7`)
      .flush({ ...detail, freshness: 'expired', validUntil: '2026-10-17T09:00:00Z' });
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Manual evidence expired');
    expect(fixture.nativeElement.textContent).toContain('Local digest matches');
    expect(fixture.nativeElement.textContent).toContain('Refresh to re-evaluate');
  });
  it('renders empty permitted results and a denied hub without a total-count disclosure', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    component.page.set({ ...page, items: [], nextCursor: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No records match in your permitted scope.',
    );
    const pending = component.load();
    list().flush({}, { status: 403, statusText: 'Forbidden' });
    await pending;
    expect(component.error()).toBe('forbidden');
    expect(component.page()).toBeNull();
  });
  for (const language of ['en', 'hi'] as const)
    it(`labels controls and passes structural axe checks in ${language}`, async () => {
      const fixture = await open(true);
      fixture.componentInstance.copy.i.locale.set(language);
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      const result = await axe.run(fixture.nativeElement, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(result.violations).toEqual([]);
      fixture.nativeElement.remove();
    });
});
