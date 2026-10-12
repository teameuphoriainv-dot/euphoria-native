import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';

import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { ThemeOverrideContext, TypographyOverrideContext } from '@/lib/design-context';

export function LessonDesignProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeOverrideContext.Provider value={LessonColors}>
      <TypographyOverrideContext.Provider value={LessonTypography}>
        {/* Lessons are always dark (owner, 2026-10-12), so the status bar is light in both appearances. */}
        <StatusBar style="light" />
        {children}
      </TypographyOverrideContext.Provider>
    </ThemeOverrideContext.Provider>
  );
}
