/**
 * Corporate Finance kit, batch C (lessons 18 to 25): what more than one of those openers needs,
 * kept apart from the earlier kits so they stay exactly as approved.
 *
 * The three signs dimmed, for the lit-sign pattern: the dim copy is stamped into the base and the
 * kit's bright sign twinkles over it as a layer, so the sign glows without vanishing at the bottom
 * of its cycle. Lesson 19 lights the invest sign, lesson 22 the return sign, and the capstone,
 * lesson 25, lights all three. Each dim copy paints its bright keys with their own shadow steps,
 * so no pixel under the layer is the colour the layer paints.
 */
import { cfSignFinance, cfSignInvest, cfSignReturn } from './cf-kit';
import { cfRecolor } from './cf-kit-a';

export const cfSignInvestDim = cfRecolor(cfSignInvest, 'cf-sign-invest-dim', { m: 'N', N: 'n' }, 'The invest sign, unlit.');
export const cfSignFinanceDim = cfRecolor(cfSignFinance, 'cf-sign-finance-dim', { B: 'b' }, 'The finance sign, unlit.');
export const cfSignReturnDim = cfRecolor(cfSignReturn, 'cf-sign-return-dim', { G: 'g', y: 'g' }, 'The return sign, unlit.');
