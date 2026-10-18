import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../../../core/services/language.service';

gsap.registerPlugin(ScrollTrigger);

type ModuleIcon = 'register' | 'notice' | 'consent' | 'rights' | 'breach' | 'retention';

interface ModuleCard {
  readonly title: string;
  readonly description: string;
  readonly icon: ModuleIcon;
}

interface AudienceCard {
  readonly title: string;
  readonly description: string;
}

interface Stat {
  readonly value: string;
  readonly label: string;
}

interface PreviewCheck {
  readonly label: string;
  readonly status: 'ready' | 'pending';
}

interface LandingCopy {
  readonly eyebrow: string;
  readonly heading: string;
  readonly subheading: string;
  readonly ctaPrimary: string;
  readonly ctaSecondaryLead: string;
  readonly ctaSecondaryAction: string;
  readonly trustStrip: readonly string[];
  readonly previewTitle: string;
  readonly previewChecks: readonly PreviewCheck[];
  readonly previewStatusReady: string;
  readonly previewStatusPending: string;
  readonly stats: readonly Stat[];
  readonly modulesHeading: string;
  readonly modulesSubheading: string;
  readonly modules: readonly ModuleCard[];
  readonly audienceHeading: string;
  readonly audience: readonly AudienceCard[];
  readonly closingHeading: string;
  readonly closingBody: string;
}

/**
 * Visual "tone" per module icon — a different, already-contrast-verified
 * color family per card so the module grid reads with the kind of visual
 * variety a modern compliance-SaaS page uses (per the Sprinto reference),
 * without introducing any color not already defined and checked in
 * src/styles/_tokens.scss. Language-independent, so it lives outside the
 * EN/HI copy objects.
 */
const MODULE_TONE: Record<ModuleIcon, string> = {
  register: 'primary',
  notice: 'violet',
  consent: 'success',
  rights: 'warning',
  breach: 'danger',
  retention: 'navy',
};

/**
 * Public marketing/informational landing page. Real, hand-written static
 * content — not a backend call, and not a stand-in "mock" for one: a
 * marketing page has no dynamic data to fetch (brief constraint is about
 * never faking *functional* data, not about every page needing an API).
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private readonly languageService = inject(LanguageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly triggers: ScrollTrigger[] = [];
  private readonly reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly language = this.languageService.language;

  readonly copy = computed<LandingCopy>(() =>
    this.language() === 'hi' ? this.hiCopy : this.enCopy,
  );

  moduleTone(icon: ModuleIcon): string {
    return MODULE_TONE[icon];
  }

  previewStatusLabel(status: PreviewCheck['status']): string {
    return status === 'ready' ? this.copy().previewStatusReady : this.copy().previewStatusPending;
  }

  ngAfterViewInit(): void {
    if (this.reduceMotion) return; // Motion is purely decorative here — every fact already exists as static, readable text.
    this.animateHero();
    this.animateOnScroll();
    this.animateHeroTilt();
  }

  ngOnDestroy(): void {
    this.triggers.forEach((trigger) => trigger.kill());
  }

  private query<T extends Element = Element>(selector: string): T[] {
    const root = this.host.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll(selector)) as T[];
  }

  /** Entrance sequence for the above-the-fold content — runs once on load, never on scroll. */
  private animateHero(): void {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 0.5 })
      .from('.hero__heading', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from('.hero__subheading', { opacity: 0, y: 16, duration: 0.5 }, '-=0.35')
      .from('.hero__ctas', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
      .from(this.query('.trust-strip__item'), { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, '-=0.25')
      .from('.hero__visual', { opacity: 0, scale: 0.94, duration: 0.7, ease: 'power2.out' }, '-=0.6');
  }

  /** Scroll-triggered reveals for everything below the fold, plus a count-up on the stats band. */
  private animateOnScroll(): void {
    const sections: { selector: string; stagger?: number }[] = [
      { selector: '.module-card', stagger: 0.08 },
      { selector: '.audience-card', stagger: 0.1 },
    ];
    for (const { selector, stagger } of sections) {
      const elements = this.query(selector);
      if (elements.length === 0) continue;
      gsap.set(elements, { opacity: 0, y: 24 });
      this.triggers.push(
        ScrollTrigger.create({
          trigger: elements[0].closest('ul') ?? elements[0],
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(elements, { opacity: 1, y: 0, duration: 0.5, stagger, ease: 'power2.out' }),
        }),
      );
    }

    const closing = this.host.nativeElement.querySelector('.closing');
    if (closing) {
      gsap.set(closing, { opacity: 0, y: 20 });
      this.triggers.push(
        ScrollTrigger.create({
          trigger: closing,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(closing, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }),
        }),
      );
    }

    const statValues = this.query<HTMLElement>('.stats-band__value');
    if (statValues.length > 0) {
      this.triggers.push(
        ScrollTrigger.create({
          trigger: '.stats-band',
          start: 'top 85%',
          once: true,
          onEnter: () => this.countUpStats(statValues),
        }),
      );
    }
  }

  /** Numeric stat values ("6", "2") count up from 0; non-numeric ones ("AA") just fade in. */
  private countUpStats(elements: HTMLElement[]): void {
    for (const el of elements) {
      const text = el.textContent?.trim() ?? '';
      const numeric = Number(text);
      if (Number.isNaN(numeric)) {
        gsap.from(el, { opacity: 0, duration: 0.5 });
        continue;
      }
      const counter = { value: 0 };
      gsap.to(counter, {
        value: numeric,
        duration: 1,
        ease: 'power1.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.value));
        },
      });
    }
  }

  /** Subtle pointer-following tilt on the hero's dashboard preview card — purely decorative, disabled under reduced motion and on touch (no pointer to follow). */
  private animateHeroTilt(): void {
    const root = this.host.nativeElement as HTMLElement;
    const visual = root.querySelector('.hero__visual') as HTMLElement | null;
    const card = root.querySelector('.preview-card') as HTMLElement | null;
    if (!visual || !card || window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (event: PointerEvent): void => {
      const rect = visual.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: relX * 8,
        rotateX: relY * -8,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    };
    const onLeave = (): void => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    };
    visual.addEventListener('pointermove', onMove);
    visual.addEventListener('pointerleave', onLeave);
  }

  private readonly enCopy: LandingCopy = {
    eyebrow: 'Built for India · DPDP Act, 2023',
    heading: 'Data protection compliance for schools and coaching centres',
    subheading:
      'Sahmati helps schools and coaching centres meet the Digital Personal Data Protection Act, 2023 — from a register of student and staff data to notices, consent, rights requests, and breach response, all in one place.',
    ctaPrimary: 'Get started',
    ctaSecondaryLead: 'Already have an account?',
    ctaSecondaryAction: 'Sign in',
    trustStrip: [
      'GIGW 3.0 & WCAG 2.1 AA accessible',
      'Available in Hindi and English',
      'Built for Indian schools and coaching centres',
    ],
    previewTitle: 'Readiness, at a glance',
    previewChecks: [
      { label: 'Register of data', status: 'ready' },
      { label: 'Privacy notice', status: 'ready' },
      { label: 'Consent capture', status: 'ready' },
      { label: 'Rights requests', status: 'pending' },
    ],
    previewStatusReady: 'Ready',
    previewStatusPending: '1 open',
    stats: [
      { value: '6', label: 'compliance modules, end to end' },
      { value: '2', label: 'languages — Hindi and English' },
      { value: 'AA', label: 'WCAG 2.1 accessibility target' },
    ],
    modulesHeading: 'What Sahmati does',
    modulesSubheading:
      'Six modules that cover the Act end to end, built for how a school actually runs.',
    modules: [
      {
        icon: 'register',
        title: 'Register of data',
        description:
          'Know what personal data you collect, why, and where it lives — a living inventory, not a one-time spreadsheet.',
      },
      {
        icon: 'notice',
        title: 'Notices',
        description:
          'Clear, bilingual privacy notices for parents and students, built from ready-made education-sector templates.',
      },
      {
        icon: 'consent',
        title: 'Consent capture',
        description:
          'Collect and record real consent, and let parents withdraw it just as easily, with every choice logged.',
      },
      {
        icon: 'rights',
        title: 'Rights & grievance desk',
        description:
          "Handle access, correction, and grievance requests from parents and students within the law's timelines.",
      },
      {
        icon: 'breach',
        title: 'Breach desk',
        description:
          'Respond to a data breach within the hours the law requires, with the right people notified automatically.',
      },
      {
        icon: 'retention',
        title: 'Retention',
        description:
          "Keep data only as long as it's needed, with automatic reminders before anything is due for deletion.",
      },
    ],
    audienceHeading: 'Who it is for',
    audience: [
      {
        title: 'School & coaching centre owners',
        description:
          "See what's done, what's pending, and who owns it — without needing to be a compliance expert.",
      },
      {
        title: 'Parents and students',
        description:
          'Understand what data is held about you, and exercise your rights, in Hindi or English, on any phone.',
      },
      {
        title: 'Staff and reception',
        description:
          'Simple step-by-step screens for daily tasks like notices and consent — no technical training required.',
      },
    ],
    closingHeading: 'Ready to see where you stand?',
    closingBody: "Get started — it takes a few minutes to set up your institution's first branch.",
  };

  private readonly hiCopy: LandingCopy = {
    eyebrow: 'भारत के लिए निर्मित · डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023',
    heading: 'स्कूलों और कोचिंग सेंटरों के लिए डेटा संरक्षण अनुपालन',
    subheading:
      'सहमति स्कूलों और कोचिंग सेंटरों को डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 का पालन करने में मदद करती है — छात्रों और स्टाफ के डेटा के रजिस्टर से लेकर सूचना, सहमति, अधिकार संबंधी निवेदन और डेटा उल्लंघन की प्रतिक्रिया तक, सब एक ही स्थान पर।',
    ctaPrimary: 'शुरू करें',
    ctaSecondaryLead: 'पहले से खाता है?',
    ctaSecondaryAction: 'साइन इन करें',
    trustStrip: [
      'GIGW 3.0 और WCAG 2.1 AA सुलभ',
      'हिन्दी और अंग्रेज़ी में उपलब्ध',
      'भारतीय स्कूलों और कोचिंग सेंटरों के लिए निर्मित',
    ],
    previewTitle: 'तैयारी, एक नज़र में',
    previewChecks: [
      { label: 'डेटा रजिस्टर', status: 'ready' },
      { label: 'गोपनीयता सूचना', status: 'ready' },
      { label: 'सहमति संग्रहण', status: 'ready' },
      { label: 'अधिकार निवेदन', status: 'pending' },
    ],
    previewStatusReady: 'तैयार',
    previewStatusPending: '1 शेष',
    stats: [
      { value: '6', label: 'अनुपालन मॉड्यूल, पूरी तरह से' },
      { value: '2', label: 'भाषाएं — हिन्दी और अंग्रेज़ी' },
      { value: 'AA', label: 'WCAG 2.1 सुलभता लक्ष्य' },
    ],
    modulesHeading: 'सहमति क्या करती है',
    modulesSubheading:
      'छह मॉड्यूल जो अधिनियम को पूरी तरह से कवर करते हैं, स्कूल के वास्तविक कामकाज के अनुसार बनाए गए।',
    modules: [
      {
        icon: 'register',
        title: 'डेटा रजिस्टर',
        description:
          'जानें कि आप कौन-सा व्यक्तिगत डेटा एकत्र करते हैं, किस उद्देश्य से, और वह कहाँ संग्रहित है — एक सतत सूची, न कि एक बार की स्प्रेडशीट।',
      },
      {
        icon: 'notice',
        title: 'सूचना (नोटिस)',
        description:
          'अभिभावकों और छात्रों के लिए स्पष्ट, द्विभाषी गोपनीयता सूचनाएं, तैयार शिक्षा-क्षेत्र टेम्पलेट्स से बनी।',
      },
      {
        icon: 'consent',
        title: 'सहमति संग्रहण',
        description:
          'वास्तविक सहमति एकत्र करें और उसे दर्ज करें — और अभिभावकों को उसे वापस लेने की सुविधा भी दें, हर विकल्प के रिकॉर्ड के साथ।',
      },
      {
        icon: 'rights',
        title: 'अधिकार और शिकायत डेस्क',
        description:
          'अभिभावकों और छात्रों से प्राप्त एक्सेस, सुधार और शिकायत संबंधी निवेदनों को कानून की समय-सीमा के भीतर संभालें।',
      },
      {
        icon: 'breach',
        title: 'डेटा उल्लंघन डेस्क',
        description:
          'कानून द्वारा निर्धारित समय-सीमा के भीतर डेटा उल्लंघन पर प्रतिक्रिया दें, सही लोगों को स्वचालित रूप से सूचित करते हुए।',
      },
      {
        icon: 'retention',
        title: 'डेटा प्रतिधारण',
        description:
          'डेटा को केवल तब तक रखें जब तक आवश्यक हो, हटाने की समय-सीमा से पहले स्वचालित रिमाइंडर के साथ।',
      },
    ],
    audienceHeading: 'यह किनके लिए है',
    audience: [
      {
        title: 'स्कूल और कोचिंग सेंटर के मालिक',
        description:
          'देखें कि क्या पूरा हो गया है, क्या शेष है, और इसकी ज़िम्मेदारी किसकी है — अनुपालन विशेषज्ञ बनने की ज़रूरत के बिना।',
      },
      {
        title: 'अभिभावक और छात्र',
        description:
          'जानें कि आपके बारे में कौन-सा डेटा रखा गया है, और अपने अधिकारों का प्रयोग करें — हिन्दी या अंग्रेज़ी में, किसी भी फोन पर।',
      },
      {
        title: 'स्टाफ और रिसेप्शन',
        description:
          'सूचना और सहमति जैसे रोज़ाना के कामों के लिए सरल, चरण-दर-चरण स्क्रीन — किसी तकनीकी प्रशिक्षण की आवश्यकता नहीं।',
      },
    ],
    closingHeading: 'देखना चाहते हैं कि आप कहाँ खड़े हैं?',
    closingBody: 'शुरू करें — अपनी संस्था की पहली शाखा सेट करने में बस कुछ ही मिनट लगते हैं।',
  };
}
