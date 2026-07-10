import { registerLanguageSwitcher } from '@/components/language-switcher';
import { registerSiteNav } from '@/components/site-nav';
import { registerThemeToggle } from '@/components/theme-toggle';

/**
 * Global client entry: registers the interactive islands that enhance
 * the pre-rendered pages. Core content never depends on this bundle.
 */
registerThemeToggle();
registerLanguageSwitcher();
registerSiteNav();
