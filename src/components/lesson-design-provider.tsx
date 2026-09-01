import type { ReactNode } from 'react';

import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { ThemeOverrideContext, TypographyOverrideContext } from '@/lib/design-context';

export function LessonDesignProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeOverrideContext.Provider value={LessonColors}>
      <TypographyOverrideContext.Provider value={LessonTypography}>
        {children}
      </TypographyOverrideContext.Provider>
    </ThemeOverrideContext.Provider>
  );
}
