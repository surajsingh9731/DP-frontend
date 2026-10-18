import { Routes } from '@angular/router';
import { PublicShellComponent } from './core/layout/public-shell/public-shell.component';
import { LandingComponent } from './features/public/landing/landing.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { LoginComponent } from './features/auth/login/login.component';
import { VerifyComponent } from './features/auth/verify/verify.component';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AppComingSoonComponent } from './features/app-coming-soon/app-coming-soon.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Two top-level route groups: the public (no-login) shell, and the
 * authenticated app shell behind `authGuard`. Each gets its own wildcard
 * redirect inside its own children array — a single top-level wildcard
 * would otherwise swallow `/app/**` before the guarded group ever runs.
 */
export const routes: Routes = [
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard — Sahmati' },
      {
        path: 'consents',
        component: AppComingSoonComponent,
        data: { titleEn: 'Consents', titleHi: 'सहमति' },
        title: 'Consents — Sahmati',
      },
      {
        path: 'requests',
        component: AppComingSoonComponent,
        data: { titleEn: 'Requests', titleHi: 'अनुरोध' },
        title: 'Requests — Sahmati',
      },
      {
        path: 'data-register',
        component: AppComingSoonComponent,
        data: { titleEn: 'Data list', titleHi: 'डेटा सूची' },
        title: 'Data list — Sahmati',
      },
      {
        path: 'notices',
        component: AppComingSoonComponent,
        data: { titleEn: 'Privacy notice', titleHi: 'गोपनीयता सूचना' },
        title: 'Privacy notice — Sahmati',
      },
      {
        path: 'breach',
        component: AppComingSoonComponent,
        data: { titleEn: 'Data leaks', titleHi: 'डेटा लीक' },
        title: 'Data leaks — Sahmati',
      },
      {
        path: 'retention',
        component: AppComingSoonComponent,
        data: { titleEn: 'Keep and delete', titleHi: 'रखें और हटाएँ' },
        title: 'Keep and delete — Sahmati',
      },
      {
        path: 'vendors',
        component: AppComingSoonComponent,
        data: { titleEn: 'Vendors', titleHi: 'वेंडर' },
        title: 'Vendors — Sahmati',
      },
      {
        path: 'staff',
        component: AppComingSoonComponent,
        data: { titleEn: 'Staff and activity', titleHi: 'स्टाफ और गतिविधि' },
        title: 'Staff and activity — Sahmati',
      },
      {
        path: 'training',
        component: AppComingSoonComponent,
        data: { titleEn: 'Training', titleHi: 'प्रशिक्षण' },
        title: 'Training — Sahmati',
      },
      {
        path: 'settings',
        component: AppComingSoonComponent,
        data: { titleEn: 'Settings', titleHi: 'सेटिंग्स' },
        title: 'Settings — Sahmati',
      },
      { path: '**', redirectTo: '' },
    ],
  },
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        component: LandingComponent,
        title: 'Sahmati — DPDP compliance for schools and coaching centres',
      },
      {
        path: 'get-started',
        component: SignupComponent,
        title: 'Get started — Sahmati',
      },
      {
        path: 'get-started/verify/:challengeId',
        component: VerifyComponent,
        title: 'Verify — Sahmati',
      },
      {
        path: 'sign-in',
        component: LoginComponent,
        title: 'Sign in — Sahmati',
      },
      {
        path: 'sign-in/verify/:challengeId',
        component: VerifyComponent,
        title: 'Verify — Sahmati',
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
