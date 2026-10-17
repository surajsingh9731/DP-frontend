import { FormGroup } from '@angular/forms';
import { createRegisterFields, parseRegisterCategories } from './register-fields.form';
import { REGISTER_CATEGORY_LIMITS, REGISTER_LIMITS } from '../../constants/register.constants';

describe('Shared setup/register fields', () => {
  it('creates independent required controls for each editor', () => {
    const first = new FormGroup(createRegisterFields());
    const second = new FormGroup(createRegisterFields());
    expect(first.invalid).toBe(true);
    first.controls.name.setValue('First editor');
    expect(second.controls.name.value).toBe('');
    first.controls.name.setValue('a'.repeat(REGISTER_LIMITS.name + 1));
    expect(first.controls.name.invalid).toBe(true);
  });
  it('trims and filters categories without changing their order or silently deduplicating', () => {
    expect(parseRegisterCategories(' A, ,B,A ')).toEqual(['A', 'B', 'A']);
  });
  it('accepts the category count boundary and rejects one extra', () => {
    const categories = Array.from(
      { length: REGISTER_CATEGORY_LIMITS.count },
      (_, i) => `Field ${i}`,
    );
    expect(parseRegisterCategories(categories.join(','))).toEqual(categories);
    expect(parseRegisterCategories([...categories, 'Extra'].join(','))).toBeNull();
  });
  it('rejects empty categories and enforces the individual category length boundary', () => {
    expect(parseRegisterCategories(' ,  ,')).toBeNull();
    const category = 'a'.repeat(REGISTER_CATEGORY_LIMITS.length);
    expect(parseRegisterCategories(category)).toEqual([category]);
    expect(parseRegisterCategories(category + 'a')).toBeNull();
  });
});
