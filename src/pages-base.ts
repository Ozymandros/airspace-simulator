/** GitHub project pages need a repo subpath; user sites use "/". */
export function pagesBase(env: {
  viteBasePath?: string;
  githubRepository?: string;
} = {}): string {
  const viteBasePath = env.viteBasePath ?? process.env.VITE_BASE_PATH;
  if (viteBasePath) return viteBasePath;

  const githubRepository =
    'githubRepository' in env ? env.githubRepository : process.env.GITHUB_REPOSITORY;

  const repo = githubRepository?.split('/')[1];
  if (!repo || repo.endsWith('.github.io')) return '/';
  return `/${repo}/`;
}
