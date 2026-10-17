import { Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session.guard';
export const routes: Routes = [
  {
    path: 'workspace/:tenantId/retention',
    title: 'Retention drafts · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/retention/retention.component').then((m) => m.RetentionComponent),
  },

  {
    path: 'workspace/:tenantId/evidence/:kind/:id/:version',
    title: 'Evidence hub · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/evidence/evidence.component').then((m) => m.EvidenceComponent),
  },
  {
    path: 'workspace/:tenantId/evidence',
    title: 'Evidence hub · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/evidence/evidence.component').then((m) => m.EvidenceComponent),
  },

  {
    path: 'workspace/:tenantId/participant/:sessionId/requests',
    title: 'My synthetic rights requests · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/rights-participant/rights-participant.component').then(
        (m) => m.RightsParticipantComponent,
      ),
  },
  {
    path: 'workspace/:tenantId/rights/:requestId',
    title: 'Synthetic rights triage · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/rights-admin/rights-admin.component').then((m) => m.RightsAdminComponent),
  },
  {
    path: 'workspace/:tenantId/rights',
    title: 'Synthetic rights triage · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/rights-admin/rights-admin.component').then((m) => m.RightsAdminComponent),
  },
  {
    path: 'workspace/:tenantId/checks/:taskId',
    title: 'Evidence-linked local checks · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/checks/checks.component').then((m) => m.ChecksComponent),
  },
  {
    path: 'workspace/:tenantId/checks',
    title: 'Evidence-linked local checks · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/checks/checks.component').then((m) => m.ChecksComponent),
  },
  {
    path: 'workspace/:tenantId/followups/:taskId',
    title: 'Withdrawal follow-up · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/followups/followups.component').then((m) => m.FollowupsComponent),
  },
  {
    path: 'workspace/:tenantId/followups',
    title: 'Withdrawal follow-up · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/followups/followups.component').then((m) => m.FollowupsComponent),
  },
  {
    path: 'workspace/:tenantId/consent-sandbox',
    title: 'Synthetic consent lab · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/consent-sandbox/consent-sandbox.component').then(
        (m) => m.ConsentSandboxComponent,
      ),
  },
  {
    path: 'workspace/:tenantId/preparation',
    title: 'Template and contact readiness · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/preparation/preparation.component').then(
        (module) => module.PreparationComponent,
      ),
  },
  {
    path: 'workspace/:tenantId/notices/:noticeId',
    title: 'Sample notice · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/notices/notices.component').then((m) => m.NoticesComponent),
  },
  {
    path: 'workspace/:tenantId/notices',
    title: 'Internal notice review · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/notices/notices.component').then((m) => m.NoticesComponent),
  },
  {
    path: 'workspace/:tenantId/setup',
    title: 'Guided setup · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () => import('./features/setup/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: 'workspace/:tenantId/register',
    title: 'Data register · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'login',
    title: 'Sign in · Sahmati',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'mailbox',
    title: 'Local mailbox · Sahmati',
    loadComponent: () =>
      import('./features/mailbox/mailbox.component').then((m) => m.MailboxComponent),
  },
  {
    path: 'workspace/:tenantId',
    title: 'Workspace · Sahmati',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/workspace/workspace.component').then((m) => m.WorkspaceComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'Sahmati · Privacy, with clarity',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  { path: '**', redirectTo: 'login' },
];
