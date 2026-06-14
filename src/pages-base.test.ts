import { describe, expect, it } from 'vitest';
import { pagesBase } from './pages-base';

describe('pagesBase', () => {
  it('returns root path for local development', () => {
    expect(pagesBase({ githubRepository: undefined })).toBe('/');
  });

  it('uses GITHUB_REPOSITORY from the environment when not overridden', () => {
    const prev = process.env.GITHUB_REPOSITORY;
    process.env.GITHUB_REPOSITORY = 'Ozymandros/airspace-simulator';
    try {
      expect(pagesBase()).toBe('/airspace-simulator/');
    } finally {
      if (prev === undefined) delete process.env.GITHUB_REPOSITORY;
      else process.env.GITHUB_REPOSITORY = prev;
    }
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
