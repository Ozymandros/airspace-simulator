import { describe, expect, it } from 'vitest';
import { pagesBase } from './pages-base';

describe('pagesBase', () => {
  it('returns root path for local development', () => {
    expect(pagesBase({})).toBe('/');
  });

  it('uses an explicit VITE_BASE_PATH when provided', () => {
    expect(pagesBase({ viteBasePath: '/custom/' })).toBe('/custom/');
  });

  it('derives project-page base path from GITHUB_REPOSITORY', () => {
    expect(pagesBase({ githubRepository: 'Ozymandros/airspace-simulator' })).toBe(
      '/airspace-simulator/',
    );
  });

  it('returns root path for user/org GitHub Pages repos', () => {
    expect(pagesBase({ githubRepository: 'Ozymandros/Ozymandros.github.io' })).toBe('/');
  });
});
