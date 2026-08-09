/**
 * Accessibility audit — Unit 13 item 6.
 *
 * WHAT IT LOOKS FOR, and why this specific thing: a control that a sighted user identifies by its
 * ICON is, to VoiceOver, a button with no name. It reads as "button" and nothing else. A raw count
 * of `accessibilityLabel` against `onPress` proves nothing, because a labelled parent legitimately
 * wraps unlabelled children — so this looks for the actual failure: an interactive element whose
 * subtree contains NO text and NO accessibilityLabel.
 *
 * It is a heuristic over source text, not a type-aware parse. It can miss a label applied through a
 * spread or a wrapper component's default. Findings are a list to CHECK, not a verdict — verify on
 * screen before changing anything. That is the same rule the plan applies to the accessibility
 * tree, which has misreported this app four separate times.
 *
 * Run: node scripts/a11y-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src/app', 'src/components', 'src/shared'];
const PRESSABLE = /<(SpringPressable|Pressable|TouchableOpacity|TouchableHighlight|Button)\b/;
/** Renders visible text, so the element has an accessible name without needing a label. */
const HAS_TEXT = /<(ThemedText|Text)\b|>[^<>{}\n]*[A-Za-z]{2,}[^<>{}\n]*</;
const HAS_LABEL = /accessibilityLabel\s*=/;
const ICON_ONLY = /<(UIcon|Ionicons|MaterialIcons|Feather|SFSymbol|Image)\b/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Slice from an opening tag to its matching close, by depth on the component name. */
function block(lines, i) {
  const m = lines[i].match(PRESSABLE);
  if (!m) return null;
  const tag = m[1];
  let depth = 0;
  const buf = [];
  for (let j = i; j < Math.min(lines.length, i + 60); j++) {
    const l = lines[j];
    buf.push(l);
    depth += (l.match(new RegExp(`<${tag}\\b`, 'g')) || []).length;
    depth -= (l.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (/\/>\s*$/.test(l) && j === i) return buf.join('\n');
    if (depth === 0 && j > i) return buf.join('\n');
  }
  return buf.join('\n');
}

const findings = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!PRESSABLE.test(line)) return;
      const b = block(lines, i);
      if (!b) return;
      if (HAS_LABEL.test(b)) return;
      if (HAS_TEXT.test(b)) return;
      findings.push({
        file: `${file}:${i + 1}`,
        iconOnly: ICON_ONLY.test(b),
        snippet: b.split('\n').slice(0, 2).map((s) => s.trim()).join(' '),
      });
    });
  }
}

const icon = findings.filter((f) => f.iconOnly);
const other = findings.filter((f) => !f.iconOnly);

console.log(`UNLABELLED INTERACTIVE ELEMENTS: ${findings.length}`);
console.log(`  with an icon and no text  : ${icon.length}   <- reads as a bare "button" to VoiceOver`);
console.log(`  no icon, no text          : ${other.length}\n`);
for (const f of [...icon, ...other]) {
  console.log(`${f.iconOnly ? 'ICON' : 'BARE'}  ${f.file}`);
  console.log(`      ${f.snippet.slice(0, 110)}`);
}
process.exitCode = 0;
