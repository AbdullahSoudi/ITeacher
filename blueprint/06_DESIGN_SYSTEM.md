# blueprint/06_DESIGN_SYSTEM.md

## Direction
Modern, minimal, professional, Arabic RTL-first.

## Font
Preferred: Cairo (or Tajawal)
Keep consistent across app.

## UI Foundations
- Background: very light neutral
- Cards: white, border 1px subtle
- Radius: 16px
- Buttons: 12px radius
- Shadows: very soft, minimal

## Components
- AppShell (Topbar + Sidebar RTL + Drawer mobile)
- Card
- Button variants (Primary/Secondary/Ghost/Destructive)
- Input + Label + Error
- Badge (status)
- Modal (credentials)
- Toasts
- Loading skeletons
- Empty states

## RTL requirements
- Root: dir="rtl"
- Sidebar right
- Align text right
- Arrows/icons mirrored where needed

## UX polish must-have
- Copy-to-clipboard for credentials
- Confirm dialogs for delete/revoke
- Clear Arabic validation messages
- Responsive layout (mobile first)
