import { requiredTextControl } from './required-text-control';

describe('Required text controls', () => {
  it('rejects blank and over-limit text while keeping each field independent', () => {
    const first = requiredTextControl(4);
    const second = requiredTextControl(10);
    first.setValue('   ');
    expect(first.invalid).toBe(true);
    first.setValue('12345');
    expect(first.hasError('maxlength')).toBe(true);
    first.setValue('1234');
    expect(first.valid).toBe(true);
    expect(second.value).toBe('');
    expect(second.hasError('required')).toBe(true);
    first.reset();
    expect(first.value).toBe('');
  });
});
