import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  effect,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  viewChildren,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { I18n } from '../i18n.service';
import { REGISTER_REFERENCE_LIMITS } from '../../constants/register.constants';
import {
  type ReferencesForm,
  storageReferenceForm,
  vendorReferenceForm,
} from './registry-references.form';
import { REFERENCES_EN, type ReferenceTextKey } from './registry-references.en';
import { REFERENCES_HI } from './registry-references.hi';
@Component({
  selector: 'app-registry-references',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registry-references.component.html',
  styleUrl: './registry-references.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryReferencesComponent {
  readonly form = input.required<ReferencesForm>();
  readonly readOnly = input(false);
  readonly busy = input(false);
  readonly i = inject(I18n);
  readonly limits = REGISTER_REFERENCE_LIMITS;
  private readonly injector = inject(Injector);
  private readonly vendorInputs = viewChildren<ElementRef<HTMLInputElement>>('vendorName');
  private readonly storageInputs = viewChildren<ElementRef<HTMLInputElement>>('storageName');
  private readonly addVendorButton = viewChild<ElementRef<HTMLButtonElement>>('addVendorButton');
  private readonly addStorageButton = viewChild<ElementRef<HTMLButtonElement>>('addStorageButton');
  constructor() {
    const changeDetector = inject(ChangeDetectorRef);
    effect((onCleanup) => {
      const subscription = this.form().valueChanges.subscribe(() => changeDetector.markForCheck());
      onCleanup(() => subscription.unsubscribe());
    });
  }
  t(key: ReferenceTextKey): string {
    return this.i.locale() === 'hi' ? REFERENCES_HI[key] : REFERENCES_EN[key];
  }
  add(kind: 'vendor' | 'storage'): void {
    if (this.readOnly() || this.busy()) return;
    const form = this.form();
    if (kind === 'vendor') {
      if (form.controls.vendorReferences.length >= this.limits.count) return;
      form.controls.vendorReferences.push(vendorReferenceForm());
    } else {
      if (form.controls.storageReferences.length >= this.limits.count) return;
      form.controls.storageReferences.push(storageReferenceForm());
    }
    form.markAsDirty();
    afterNextRender(
      () => {
        const inputs = kind === 'vendor' ? this.vendorInputs() : this.storageInputs();
        inputs.at(-1)?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }
  remove(kind: 'vendor' | 'storage', index: number): void {
    if (this.readOnly() || this.busy()) return;
    const rows =
      kind === 'vendor'
        ? this.form().controls.vendorReferences
        : this.form().controls.storageReferences;
    rows.removeAt(index);
    this.form().markAsDirty();
    afterNextRender(
      () => {
        const inputs = kind === 'vendor' ? this.vendorInputs() : this.storageInputs();
        const next = inputs[Math.min(index, inputs.length - 1)]?.nativeElement;
        const button = kind === 'vendor' ? this.addVendorButton() : this.addStorageButton();
        (next ?? button?.nativeElement)?.focus();
      },
      { injector: this.injector },
    );
  }
  paperUnmapped(): boolean {
    return (
      this.form().controls.hasPaperRecords.value &&
      !this.form().controls.storageReferences.value.some((row) => row.medium === 'paper')
    );
  }
}
