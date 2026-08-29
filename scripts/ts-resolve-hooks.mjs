// Resolve hook so plain Node can import this app's TypeScript directly.
//
// The curriculum and lesson-steps modules use bundler-style extensionless
// specifiers ('../helpers'). Metro resolves those; Node's ESM resolver does
// not. Rather than reimplement the modules under test in a checker -- which is
// how a checker drifts away from the thing it checks -- append the extension
// and let Node's own type stripping handle the rest.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(pathToFileURL(new URL('./ts-resolve-impl.mjs', import.meta.url).pathname).href);
