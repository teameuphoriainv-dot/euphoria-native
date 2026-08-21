import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (!specifier.startsWith('.') || !context.parentURL) throw err;
    const base = dirname(fileURLToPath(context.parentURL));
    for (const cand of [`${specifier}.ts`, `${specifier}.tsx`, `${specifier}/index.ts`]) {
      const p = resolvePath(base, cand);
      if (existsSync(p)) return { url: pathToFileURL(p).href, shortCircuit: true, format: 'module-typescript' };
    }
    throw err;
  }
}
