import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { AuthApiService } from '../../api/auth-api.service';
import { LanguageService } from '../../services/language.service';
import { LanguageToggleComponent } from '../../ui/language-toggle/language-toggle.component';
import { IconComponent, type IconName } from '../../ui/icon/icon.component';

interface NavItem {
  path: string;
  labelEn: string;
  labelHi: string;
  icon: IconName;
}

/**
 * Shell for every signed-in (owner/staff/viewer) screen — persistent
 * sidebar nav + topbar with the organisation name and sign-out, matching
 * the prototype's desktop layout. `authGuard` on the parent route ensures
 * this never renders without a valid session.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LanguageToggleComponent, IconComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  host: {
    '[attr.lang]': 'language()',
  },
})
export class AppShellComponent {
  private readonly sessionService = inject(SessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly session = this.sessionService.session;
  readonly orgInitial = computed(() =>
    (this.session()?.organisationName ?? '?').slice(0, 1).toUpperCase(),
  );

  readonly navItems: NavItem[] = [
    { path: '/app', labelEn: 'Home', labelHi: 'होम', icon: 'home' },
    { path: '/app/consents', labelEn: 'Consents', labelHi: 'सहमति', icon: 'shield' },
    { path: '/app/requests', labelEn: 'Requests', labelHi: 'अनुरोध', icon: 'inbox' },
    { path: '/app/data-register', labelEn: 'Data list', labelHi: 'डेटा सूची', icon: 'database' },
    { path: '/app/notices', labelEn: 'Privacy notice', labelHi: 'गोपनीयता सूचना', icon: 'file' },
    { path: '/app/breach', labelEn: 'Data leaks', labelHi: 'डेटा लीक', icon: 'alert' },
    { path: '/app/retention', labelEn: 'Keep and delete', labelHi: 'रखें और हटाएँ', icon: 'trash' },
    { path: '/app/vendors', labelEn: 'Vendors', labelHi: 'वेंडर', icon: 'briefcase' },
    {
      path: '/app/staff',
      labelEn: 'Staff and activity',
      labelHi: 'स्टाफ और गतिविधि',
      icon: 'users',
    },
    { path: '/app/training', labelEn: 'Training', labelHi: 'प्रशिक्षण', icon: 'cap' },
    { path: '/app/partner', labelEn: 'Partner portal', labelHi: 'पार्टनर पोर्टल', icon: 'briefcase' },
    { path: '/app/evidence', labelEn: 'Evidence', labelHi: 'प्रमाण', icon: 'file' },
    { path: '/app/checks', labelEn: 'Live checks', labelHi: 'लाइव जांच', icon: 'shield' },
    { path: '/app/security', labelEn: 'Security', labelHi: 'सुरक्षा', icon: 'alert' },
    { path: '/app/developers', labelEn: 'Developer API', labelHi: 'डेवलपर API', icon: 'database' },
    { path: '/app/billing', labelEn: 'Plan and billing', labelHi: 'योजना और बिलिंग', icon: 'briefcase' },
    { path: '/app/admin', labelEn: 'Platform admin', labelHi: 'प्लेटफ़ॉर्म एडमिन', icon: 'settings' },
    { path: '/app/settings', labelEn: 'Settings', labelHi: 'सेटिंग्स', icon: 'settings' },
  ];

  signOut(): void {
    this.authApi.logout().subscribe(() => void this.router.navigateByUrl('/sign-in'));
  }
}
