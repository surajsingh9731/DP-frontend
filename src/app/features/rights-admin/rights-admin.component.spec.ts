import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type { RightsDetail } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
registerLocaleData(hindiLocale);
import { tenant, row, path } from '../../core/rights/rights.fixture.spec-data';
import { RightsAdminComponent } from './rights-admin.component';
describe('Assigned synthetic rights triage', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  function role(value: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Synthetic',
      memberships: [{ tenantId: tenant, name: 'Sample', branch: 'Branch', role: value }],
    });
  }
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant, requestId: row.id }));
    TestBed.configureTestingModule({
      imports: [RightsAdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    role('owner');
  });
  function flush(data: RightsDetail = row, owner = true) {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(path).flush([data]);
    if (owner) http.expectOne(`/api/tenants/${tenant}/followups/assignees`).flush([]);
    http.expectOne(`${path}/${row.id}`).flush(data);
  }
  async function open(data: RightsDetail = row, owner = true) {
    const fixture = TestBed.createComponent(RightsAdminComponent);
    flush(data, owner);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    return fixture;
  }
  function fill(component: RightsAdminComponent) {
    component.form.patchValue({
      action: 'declare_item',
      workItemId: 'item-one',
      note: 'Synthetic internal instruction',
      references: 'sample-evidence:declaration',
      ack: true,
    });
  }
  it('shows private work only in triage and focuses selected request heading', async () => {
    const fixture = await open();
    expect(fixture.nativeElement.textContent).toContain('Private synthetic vendor');
    expect(fixture.componentInstance.selected()?.source.entryVersion).toBe(2);
  });
  it('keeps owner response, assignment and verification controls unavailable to staff', async () => {
    role('staff');
    const fixture = await open(row, false),
      component = fixture.componentInstance;
    expect(component.actions()).not.toContain('respond');
    expect(component.actions()).not.toContain('verify_item');
    expect(component.actions()).not.toContain('assign');
    fill(component);
    component.form.controls.action.setValue('respond');
    await component.act();
    expect(component.error()).toBe('invalid');
  });
  it('requires safe evidence labels, action-specific fields and acknowledgement', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    fill(component);
    component.form.controls.references.setValue('https://example.test/private');
    await component.act();
    expect(component.error()).toBe('invalid');
    component.form.controls.references.setValue('sample-evidence:declaration');
    component.form.controls.ack.setValue(false);
    await component.act();
    expect(component.error()).toBe('invalid');
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'POST');
  });
  it('requires explicit reviewed response and unresolved closure acknowledgement', async () => {
    const fixture = await open({ ...row, status: 'responded' }),
      component = fixture.componentInstance;
    component.form.patchValue({
      action: 'close',
      note: 'Synthetic close with blockers',
      ack: true,
    });
    await component.act();
    expect(component.error()).toBe('invalid');
    component.form.controls.closeAck.setValue(true);
    const pending = component.act(),
      http = TestBed.inject(HttpTestingController),
      request = await vi.waitFor(() => http.expectOne(`${path}/${row.id}/actions`));
    expect(request.request.body).toMatchObject({
      version: 2,
      action: 'close',
      unresolvedAcknowledged: true,
    });
    request.flush({ ...row, status: 'closed' });
    await vi.waitFor(() => http.expectOne(path)).then((r) => r.flush([row]));
    http.expectOne(`/api/tenants/${tenant}/followups/assignees`).flush([]);
    http.expectOne(`${path}/${row.id}`).flush({ ...row, status: 'closed' });
    await pending;
    expect(component.selected()?.workItems[1]!.status).toBe('unknown');
  });
  it('pins request version, submits actual form and retains safe retry key after failure', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    fill(component);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const http = TestBed.inject(HttpTestingController),
      first = await vi.waitFor(() => http.expectOne(`${path}/${row.id}/actions`));
    const key = first.request.body.idempotencyKey;
    expect(first.request.body.version).toBe(2);
    first.flush({}, { status: 409, statusText: 'Conflict' });
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    expect(component.error()).toBe('conflict');
    const pending = component.act(),
      retry = await vi.waitFor(() => http.expectOne(`${path}/${row.id}/actions`));
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush({}, { status: 409, statusText: 'Conflict' });
    await pending;
  });
  it('clears old private detail when access is revoked during refresh', async () => {
    const fixture = await open(),
      component = fixture.componentInstance,
      pending = component.load(),
      http = TestBed.inject(HttpTestingController);
    http.expectOne(path).flush({}, { status: 403, statusText: 'Forbidden' });
    http.expectOne(`/api/tenants/${tenant}/followups/assignees`);
    http.expectOne(`${path}/${row.id}`);
    await pending;
    expect(component.selected()).toBeNull();
    expect(component.requests()).toEqual([]);
    expect(component.error()).toBe('forbidden');
  });
  for (const language of ['en', 'hi'] as const)
    it(`has labelled actions and no axe violations in ${language}`, async () => {
      const fixture = await open();
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
