#!/usr/bin/env node
/**
 * Apple 5.1.2(i): disclose third-party AI sharing and ask before transmitting user text.
 */
import { readFileSync } from 'node:fs';

const src = readFileSync('src/app/chat.tsx', 'utf8');
const fail = (message) => {
  console.error(`[ai-consent-pin] ${message}`);
  process.exit(1);
};

if (!/Share this chat with Atlas\?/.test(src)) fail('the pre-send consent prompt is missing');
if (!/sent to Google Gemini/.test(src)) fail('the prompt must name Google Gemini and disclose transmission');
if (!/Do not include personal or sensitive information/.test(src)) fail('the prompt must warn against sensitive input');
if (!/if \(aiConsent\)[\s\S]*?Alert\.alert\(/.test(src)) fail('send must gate the first model request on consent');
if (!/setAiConsent\(true\)[\s\S]*?submit\(\)/.test(src)) fail('Continue must record consent before submitting');
if (!/\{ text: 'Cancel', style: 'cancel' \}/.test(src)) fail('the prompt must provide a non-transmitting cancel path');

console.log('[ai-consent-pin] ok');
