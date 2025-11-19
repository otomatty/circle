import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('should handle objects', () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe('foo baz');
  });

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('should merge Tailwind classes correctly', () => {
    // tailwind-mergeの機能をテスト
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2'); // 後者のクラスが優先される
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined', () => {
    const result = cn('foo', null, undefined, 'bar');
    expect(result).toBe('foo bar');
  });
});

