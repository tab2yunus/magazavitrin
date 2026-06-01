# Task 5-a: Admin Brand Identity & Theme Settings

## Summary
Added "Marka Kimliği" (Brand Identity) and "Tema" (Theme) tabs to admin settings panel, and upgraded admin panel design with CSS variable-based theming.

## Files Modified
1. `/home/z/my-project/src/components/admin/settings-tab.tsx` - Major changes:
   - Added brand_identity (12 fields) and theme (18 fields) to DEFAULT_SETTINGS
   - Added 'color' type to renderField() with color picker + hex input
   - Added Marka Kimliği and Tema to TAB_CONFIG
   - Created renderBrandIdentityTab() with 3 card sections
   - Created renderThemeTab() with preset selector, live preview, and color groups
   - Replaced hardcoded hex colors with CSS variable references
   - Added initialTab prop to SettingsTab component

2. `/home/z/my-project/src/components/admin/admin-panel.tsx` - Major changes:
   - Added expandable Ayarlar submenu with Marka Kimliği and Tema sub-items
   - Replaced all hardcoded hex colors with CSS variable references
   - Added brand_identity and theme cases to renderContent switch
   - Added currentLabel derivation for child menu items

## Key Decisions
- Used CSS variables (var(--color-primary), etc.) instead of useBrand() hook for static styling in admin panel
- Theme presets defined locally in settings-tab.tsx (THEME_PRESETS_ADMIN) matching the exact values from the task spec
- Live preview in theme tab is a mini-mockup showing header/hero/cards/footer with current color values
- SettingsTab accepts initialTab prop so admin sidebar can navigate directly to specific settings tabs

## Lint Status
0 errors, 0 warnings
