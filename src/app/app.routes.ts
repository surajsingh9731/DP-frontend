import { Routes } from '@angular/router';
import { PublicShellComponent } from './core/layout/public-shell/public-shell.component';
import { LandingComponent } from './features/public/landing/landing.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { LoginComponent } from './features/auth/login/login.component';
import { VerifyComponent } from './features/auth/verify/verify.component';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ConsentsComponent } from './features/consents/consents.component';
import { RequestsComponent } from './features/requests/requests.component';
import { RegisterComponent } from './features/register/register.component';
import { NoticesComponent } from './features/notices/notices.component';
import { BreachComponent } from './features/breach/breach.component';
import { RetentionComponent } from './features/retention/retention.component';
import { VendorsComponent } from './features/vendors/vendors.component';
import { TrainingComponent } from './features/training/training.component';
import { StaffComponent } from './features/staff/staff.component';
import { SettingsComponent } from './features/settings/settings.component';
import { PartnerComponent } from './features/partner/partner.component';
import { AppComingSoonComponent } from './features/app-coming-soon/app-coming-soon.component';
import { PrivacyCenterComponent } from './features/public/participant/privacy-center/privacy-center.component';
import { ParticipantVerifyComponent } from './features/public/participant/verify/participant-verify.component';
import { MyConsentComponent } from './features/public/participant/my-consent/my-consent.component';
import { MyRequestsComponent } from './features/public/participant/my-requests/my-requests.component';
import { authGuard } from './core/guards/auth.guard';
import { participantGuard } from './core/guards/participant.guard';

/**
 * Two top-level route groups: the public (no-login) shell, and the
 * authenticated app shell behind `authGuard`. Each gets its own wildcard
 * redirect inside its own children array — a single top-level wildcard
 * would otherwise swallow `/app/**` before the guarded group ever runs.
 *
 */
export const routes: Routes = [
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard — Sahmati' },
      { path: 'consents', component: ConsentsComponent, title: 'Consents — Sahmati' },
      { path: 'requests', component: RequestsComponent, title: 'Requests — Sahmati' },
      { path: 'data-register', component: RegisterComponent, title: 'Data list — Sahmati' },
      { path: 'notices', component: NoticesComponent, title: 'Privacy notice — Sahmati' },
      { path: 'breach', component: BreachComponent, title: 'Data leaks — Sahmati' },
      { path: 'retention', component: RetentionComponent, title: 'Keep and delete — Sahmati' },
      { path: 'vendors', component: VendorsComponent, title: 'Vendors — Sahmati' },
      { path: 'training', component: TrainingComponent, title: 'Training — Sahmati' },
      { path: 'staff', component: StaffComponent, title: 'Staff — Sahmati' },
      { path: 'settings', component: SettingsComponent, title: 'Settings — Sahmati' },
      { path: 'partner', component: PartnerComponent, title: 'Partner portal — Sahmati' },
      // No real backend yet for these (Modules K/N/Q/R and the three
      // evidence/live-check/change-impact workflow additions) — an honest
      // placeholder, never fabricated sample data, per the FRS gap list.
      {
        path: 'billing',
        component: AppComingSoonComponent,
        data: { titleEn: 'Plan and billing', titleHi: 'योजना और बिलिंग' },
        title: 'Billing — Sahmati',
      },
      {
        path: 'security',
        component: AppComingSoonComponent,
        data: { titleEn: 'Security checklist', titleHi: 'सुरक्षा जांच सूची' },
        title: 'Security — Sahmati',
      },
      {
        path: 'evidence',
        component: AppComingSoonComponent,
        data: { titleEn: 'Evidence hub', titleHi: 'प्रमाण केंद्र' },
        title: 'Evidence — Sahmati',
      },
      {
        path: 'checks',
        component: AppComingSoonComponent,
        data: { titleEn: 'Live checks', titleHi: 'लाइव जांच' },
        title: 'Live checks — Sahmati',
      },
      {
        path: 'developers',
        component: AppComingSoonComponent,
        data: { titleEn: 'Developer API', titleHi: 'डेवलपर API' },
        title: 'Developer API — Sahmati',
      },
      {
        path: 'admin',
        component: AppComingSoonComponent,
        data: { titleEn: 'Platform admin', titleHi: 'प्लेटफ़ॉर्म एडमिन' },
        title: 'Admin — Sahmati',
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
      // Everything below is per-organisation and must stay after every
      // static Sahmati-own route above, since ':orgSlug' would otherwise
      // shadow 'get-started', 'sign-in', etc.
      {
        path: ':orgSlug',
        component: PrivacyCenterComponent,
        title: 'Privacy Center — Sahmati',
      },
      {
        path: ':orgSlug/verify',
        component: ParticipantVerifyComponent,
        title: 'Verify — Sahmati',
      },
      {
        path: ':orgSlug/my-consent',
        component: MyConsentComponent,
        canActivate: [participantGuard],
        title: 'My consent — Sahmati',
      },
      {
        path: ':orgSlug/my-requests',
        component: MyRequestsComponent,
        canActivate: [participantGuard],
        title: 'My requests — Sahmati',
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
