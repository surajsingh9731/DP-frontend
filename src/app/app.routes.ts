import { Routes } from '@angular/router';
import { PublicShellComponent } from './core/layout/public-shell/public-shell.component';
import { LandingComponent } from './features/public/landing/landing.component';
import { ComingSoonComponent } from './features/public/coming-soon/coming-soon.component';

/**
 * The public (no-login) route group — no guard, no session-bearing
 * interceptor (plan §5). The authenticated route group (`AppShellComponent`
 * + guarded routes) does not exist yet; it is out of scope for this pass.
 */
export const routes: Routes = [
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
        component: ComingSoonComponent,
        data: { flow: 'get-started' },
        title: 'Get started — Sahmati',
      },
      {
        path: 'sign-in',
        component: ComingSoonComponent,
        data: { flow: 'sign-in' },
        title: 'Sign in — Sahmati',
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
