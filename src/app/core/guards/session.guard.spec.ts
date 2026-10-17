import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { Api } from '../api.service';
import { sessionGuard } from './session.guard';

describe('Session route guard', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function check() {
    return firstValueFrom(
      TestBed.runInInjectionContext(() =>
        sessionGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ) as Observable<boolean | UrlTree>,
    );
  }
  it('revalidates the session before permitting a protected route', async () => {
    const result = check();
    const session = { displayName: 'Sample owner', memberships: [] };
    TestBed.inject(HttpTestingController).expectOne('/api/auth/me').flush(session);
    expect(await result).toBe(true);
    expect(TestBed.inject(Api).session()).toEqual(session);
  });
  it('clears stale cached membership and redirects to sign-in after rejection', async () => {
    TestBed.inject(Api).session.set({ displayName: 'Old session', memberships: [] });
    const result = check();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(Router).serializeUrl((await result) as UrlTree)).toBe('/login');
    expect(TestBed.inject(Api).session()).toBeNull();
  });
});
