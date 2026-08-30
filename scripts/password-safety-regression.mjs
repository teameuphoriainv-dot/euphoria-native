#!/usr/bin/env node
import { pwnedCountForHash } from '../src/lib/pwned-passwords.ts';

const hash = 'ABCDE1234567890ABCDEF1234567890ABCDEF123';
const body = [
  '00000000000000000000000000000000000:4',
  '1234567890ABCDEF1234567890ABCDEF123:73',
  'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0',
].join('\r\n');

if (pwnedCountForHash(hash, body) !== 73)
  throw new Error('matching compromised suffix was not detected');
if (pwnedCountForHash('ABCDE99999999999999999999999999999999999', body) !== 0)
  throw new Error('an unrelated suffix was reported as compromised');
if (pwnedCountForHash('ABCDEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', body) !== 0)
  throw new Error('HIBP padding rows with count zero must be ignored');

console.log('[password-safety-regression] k-anonymous suffix matching passed');
