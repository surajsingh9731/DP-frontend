import { registerLocaleData } from '@angular/common';
import localeHi from '@angular/common/locales/hi';
import { By } from '@angular/platform-browser';
import { RegistryReferencesComponent } from '../../core/registry-references/registry-references.component';
import {
  vendorReferenceForm,
  storageReferenceForm,
} from '../../core/registry-references/registry-references.form';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { Api } from '../../core/api.service';
const tenant = 'test-tenant';
const draft = {
  id: 'draft-1',
  version: 1,
  status: 'draft' as const,
  name: 'Admissions',
  purposeEn: 'Manage admissions',
  purposeHi: 'प्रवेश प्रबंधन',
  dataCategories: ['Contact'],
  storageLocation: 'Local test',
  retentionNote: 'Review required',
  contact: 'Sample contact',
  createdAt: '2026-10-17T00:00:00Z',
  updatedAt: '2026-10-17T00:00:00Z',
};
describe('Draft register', () => {
  registerLocaleData(localeHi);
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
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
    TestBed.inject(Api).session.set({
      displayName: 'Owner',
      memberships: [{ tenantId: tenant, name: 'Test', branch: 'Test branch', role: 'owner' }],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function setup() {
    const fixture = TestBed.createComponent(RegisterComponent);
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/tenants/${tenant}/register`)
      .flush([draft]);
    fixture.detectChanges();
    return fixture;
  }
  it('preserves edited input after a version conflict and sends the selected version', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.select(draft);
    component.form.controls.name.setValue('My unsaved edit');
    component.save();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `/api/tenants/${tenant}/register/draft-1`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.version).toBe(1);
    request.flush({}, { status: 409, statusText: 'Conflict' });
    expect(component.form.controls.name.value).toBe('My unsaved edit');
    expect(component.error()).toBe('conflict');
    expect(component.busy()).toBe(false);
  });
  it('adopts the returned version after a successful save', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.select(draft);
    component.save();
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/tenants/${tenant}/register/draft-1`)
      .flush({ ...draft, version: 2 });
    expect(component.selected()?.version).toBe(2);
    expect(component.notice()).toBe('saved');
  });
  it('does not allow a viewer to send a mutation and previews only the saved entry', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    TestBed.inject(Api).session.set({
      displayName: 'Viewer',
      memberships: [{ tenantId: tenant, name: 'Test', branch: 'Branch', role: 'viewer' }],
    });
    component.select(draft);
    component.save();
    TestBed.inject(HttpTestingController).expectNone(
      (request) => request.method === 'PATCH' || request.method === 'POST',
    );
    component.i.locale.set('hi');
    component.showPreview();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `/api/tenants/${tenant}/register/draft-1/notice-preview?language=hi`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      entryId: draft.id,
      version: 1,
      language: 'hi',
      status: 'unreviewed-draft',
      title: 'नमूना',
      warning: 'समीक्षा बाकी',
      body: 'टेक्स्ट',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notice-preview').getAttribute('lang')).toBe('hi');
    expect(fixture.nativeElement.textContent).toContain('समीक्षा बाकी');
  });
  it('round-trips references and preserves them on conflict', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    const vendorReferences = [{ name: 'Test processor', service: 'Document storage' }];
    const storageReferences = [
      { name: 'Archive', medium: 'paper' as const, location: 'Test shelf' },
    ];
    component.select({ ...draft, vendorReferences, storageReferences, hasPaperRecords: true });
    component.save();
    const request = TestBed.inject(HttpTestingController).expectOne(
      `/api/tenants/${tenant}/register/draft-1`,
    );
    expect(request.request.body.vendorReferences).toEqual(vendorReferences);
    expect(request.request.body.storageReferences).toEqual(storageReferences);
    expect(request.request.body.hasPaperRecords).toBe(true);
    request.flush({}, { status: 409, statusText: 'Conflict' });
    expect(component.references.getRawValue()).toEqual({
      vendorReferences,
      storageReferences,
      hasPaperRecords: true,
    });
  });
  it('shows references in historical revisions and Hindi readonly mode', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    const saved = {
      ...draft,
      vendorReferences: [{ name: 'Sample vendor', service: 'Sample service' }],
      storageReferences: [{ name: 'Cabinet', medium: 'paper' as const, location: 'Sample shelf' }],
      hasPaperRecords: true,
    };
    component.select(saved);
    component.history();
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/tenants/${tenant}/register/draft-1/history`)
      .flush([{ version: 1, data: saved, createdAt: draft.createdAt }]);
    TestBed.inject(Api).session.set({
      displayName: 'Viewer',
      memberships: [{ tenantId: tenant, name: 'Test', branch: 'Branch', role: 'viewer' }],
    });
    component.i.locale.set('hi');
    fixture.detectChanges();
    const references = fixture.nativeElement.querySelector('app-registry-references');
    expect(references.querySelectorAll('button').length).toBe(0);
    expect(references.textContent).toContain('आंतरिक संदर्भ');
    expect(fixture.nativeElement.querySelector('.revision-list').textContent).toContain(
      'Sample vendor',
    );
    expect(fixture.nativeElement.querySelector('.revision-list').textContent).toContain(
      'Sample shelf',
    );
  });
  it('renders saved reference rows when selection changes without replacing the shared form', async () => {
    const fixture = setup();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    component.select({
      ...draft,
      vendorReferences: [{ name: 'Saved vendor', service: 'Sample service' }],
      storageReferences: [{ name: 'Saved archive', medium: 'paper', location: 'Saved shelf' }],
      hasPaperRecords: true,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const references = fixture.nativeElement.querySelector('app-registry-references');
    expect(references.querySelector('#vendor-name-0')?.value).toBe('Saved vendor');
    expect(references.querySelector('#storage-location-0')?.value).toBe('Saved shelf');
    component.select(draft);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(references.querySelector('#vendor-name-0')).toBeNull();
    expect(references.querySelector('#storage-location-0')).toBeNull();
  });
  it('rejects incomplete or duplicate references and paper mismatch before a network write', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.select(draft);
    const vendor = vendorReferenceForm();
    component.references.controls.vendorReferences.push(vendor);
    component.save();
    expect(component.form.invalid).toBe(true);
    vendor.setValue({ name: 'A', service: 'Storage' });
    const duplicate = vendorReferenceForm();
    duplicate.setValue({ name: ' a ', service: 'storage' });
    component.references.controls.vendorReferences.push(duplicate);
    expect(component.references.controls.vendorReferences.hasError('duplicate')).toBe(true);
    component.save();
    component.references.controls.vendorReferences.clear();
    const storage = storageReferenceForm();
    storage.setValue({ name: 'Shelf', medium: 'paper', location: 'Test' });
    component.references.controls.storageReferences.push(storage);
    component.save();
    expect(component.references.hasError('paperMismatch')).toBe(true);
    TestBed.inject(HttpTestingController).expectNone(
      (request) => request.method === 'PATCH' || request.method === 'POST',
    );
  });
  it('bounds row addition and marks an unmapped paper declaration', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.select(draft);
    const editor = fixture.debugElement.query(By.directive(RegistryReferencesComponent))
      .componentInstance as RegistryReferencesComponent;
    for (let index = 0; index < 11; index++) editor.add('vendor');
    expect(component.references.controls.vendorReferences.length).toBe(10);
    component.references.controls.hasPaperRecords.setValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mapping-note').textContent).toContain(
      'not mapped',
    );
  });
});
