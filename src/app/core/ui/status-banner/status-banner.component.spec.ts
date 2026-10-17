import { TestBed } from '@angular/core/testing';
import { StatusBannerComponent } from './status-banner.component';

describe('StatusBannerComponent', () => {
  it('renders the error text in an assertive alert and the status text in a polite status region', () => {
    TestBed.configureTestingModule({ imports: [StatusBannerComponent] });
    const fixture = TestBed.createComponent(StatusBannerComponent);
    fixture.componentRef.setInput('errorText', 'Something failed');
    fixture.componentRef.setInput('statusText', 'Saved');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')?.textContent?.trim()).toBe('Something failed');
    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Saved');
  });

  it('appends the loading text only while loading is true', () => {
    TestBed.configureTestingModule({ imports: [StatusBannerComponent] });
    const fixture = TestBed.createComponent(StatusBannerComponent);
    fixture.componentRef.setInput('statusText', '');
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingText', 'Loading…');
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent?.trim(),
    ).toBe('Loading…');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent?.trim(),
    ).toBe('');
  });
});
