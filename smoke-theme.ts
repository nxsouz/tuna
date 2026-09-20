import { THEME_PRESETS } from '@/theme/presets';
import { defaultSettings } from '@/config/settings';
import { themeVariables, googleFontsHref, fontFamilyStacks } from '@/theme/css';

const base = defaultSettings().theme;

console.log('=== slate / auto, no overrides ===');
console.log(themeVariables(THEME_PRESETS.slate, { ...base, mode: 'auto' }));

console.log('\n=== kitchen / light, hostile overrides ===');
console.log(
  themeVariables(THEME_PRESETS.kitchen, {
    ...base,
    accent: 'red; } * { display: none } .x {',
    surface: '#fff',
    ink: 'rgb(10 10 10 / 90%)',
    accentInk: '</style><script>alert(1)</script>',
    radius: 'round',
    density: 'compact',
    fontDisplay: 'Poppins',
    fontBody: '"Helvetica Neue", Helvetica, sans-serif',
  }),
);

console.log('\n=== fonts ===');
for (const preset of Object.values(THEME_PRESETS)) {
  console.log(preset.id.padEnd(12), googleFontsHref(preset, base));
}
console.log('override display only:', googleFontsHref(THEME_PRESETS.slate, { ...base, fontDisplay: 'Poppins' }));
console.log('override both as stacks:', googleFontsHref(THEME_PRESETS.slate, { ...base, fontDisplay: 'Georgia, serif', fontBody: 'system-ui' }));
console.log('stacks:', fontFamilyStacks(THEME_PRESETS.slate, { ...base, fontDisplay: 'Poppins' }));

console.log('\n=== dark mode root ===');
console.log(themeVariables(THEME_PRESETS.forge, { ...base, mode: 'dark', accent: '#ffe066' }).split('\n').slice(0, 8).join('\n'));
