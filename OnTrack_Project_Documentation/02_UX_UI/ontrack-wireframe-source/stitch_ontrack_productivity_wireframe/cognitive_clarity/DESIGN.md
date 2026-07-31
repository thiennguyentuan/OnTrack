---
name: Cognitive Clarity
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#424754'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#62fae3'
  on-secondary-container: '#007165'
  tertiary: '#6b38d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#8455ef'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 20px
  stack-gap-sm: 8px
  stack-gap-md: 16px
  stack-gap-lg: 24px
  gutter: 12px
---

## Brand & Style

The design system is engineered for the student experience, prioritizing cognitive ease and emotional regulation during high-stress academic periods. The brand personality is "The Calm Mentor": supportive, organized, and quietly encouraging. 

The aesthetic leans into **Soft Minimalism** with a **Tactile** edge. It avoids the dense, data-heavy look of traditional enterprise project management in favor of a "breathe-easy" interface. This is achieved through generous negative space, high-quality typography, and a "soft-touch" physical metaphor where cards and buttons feel substantial but approachable. The goal is to transform a student's chaotic to-do list into an achievable path forward.

## Colors

This design system utilizes a bright, refreshing palette designed to differentiate between types of academic effort. 

- **Primary Blue (#3B82F6):** Used for primary actions and general navigation.
- **Turquoise Secondary (#2DD4BF):** Used for supportive accents and creative tasks.
- **High Focus Purple (#8B5CF6):** A deep, saturated tone reserved specifically for intense deep-work sessions to signal a change in mental state.
- **Normal Focus (#60A5FA):** A lighter, airier blue for standard study periods.
- **The Ground:** All elements sit on a soft off-white background (#FAFAFA) to reduce eye strain compared to pure white, providing a paper-like quality.

## Typography

Inter is chosen for its exceptional legibility on mobile screens and its neutral yet modern character. 

- **Hierarchy:** Use `Display` sparingly for "Welcome" states or empty screen headlines. `Headline-lg` is the standard for page titles.
- **Rhythm:** Maintain a clear vertical rhythm by ensuring line heights are multiples of 4.
- **Style:** Labels use slightly increased letter spacing and uppercase styling to distinguish them from body copy in dense task lists.
- **Accessibility:** Never go below 12px for any functional text.

## Layout & Spacing

The design system follows a **Fluid 4-column Grid** for mobile, but emphasizes a "Containment" strategy where content is grouped into cards that float within the 20px safe-area margins.

- **Non-Dense Philosophy:** Information density is intentionally kept low. Every primary task card should have at least 16px of vertical breathing room from the next.
- **Touch Targets:** All interactive elements (buttons, checkboxes, list items) must maintain a minimum hit area of 48x48dp to ensure ease of use while walking or commuting.
- **Bottom-Heavy:** Place key actions within the "thumb zone" (bottom 1/3 of the screen), utilizing Bottom Sheets for complex inputs.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** combined with **Ambient Shadows**.

- **Level 0 (Background):** #FAFAFA.
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF). This creates a subtle but clear lift from the background.
- **Shadows:** Use a single, soft, highly-diffused shadow for Level 1 elements (Y: 4px, Blur: 12px, Color: rgba(0,0,0, 0.05)).
- **Level 2 (Active/Dialogs):** Use a slightly stronger shadow (Y: 8px, Blur: 24px, Color: rgba(0,0,0, 0.08)) and a 1px border in a very light neutral (#F1F5F9) to define edges.
- **No Heavy Outlines:** Avoid dark borders; let the contrast between the off-white background and white cards do the structural work.

## Shapes

The shape language is friendly and approachable. 

- **Primary Cards:** Use `rounded-xl` (24px) to create a soft, modern container feel.
- **Buttons & Inputs:** Use `rounded-lg` (16px) to provide enough curve to feel "friendly" while maintaining a distinct interactive look.
- **Badges/Chips:** Use fully pill-shaped (rounded-full) corners.
- **Visual Consistency:** Ensure that nested elements (like a button inside a card) have a slightly smaller radius than their container to maintain optical harmony.

## Components

### Buttons
- **Primary:** Solid #3B82F6 background, white text. 16px corner radius. Min-height 52px.
- **Secondary:** Light Turquoise #CCFBF1 background with #0D9488 text. 
- **Destructive:** Soft Red #FEE2E2 background with #EF4444 text. 

### Cards (Deadlines & Tasks)
- White background, 24px radius, soft ambient shadow.
- Inner padding should be a consistent 20px. 
- Deadlines should feature a 4px left-border accent using the semantic color (e.g., Red for overdue).

### Focus Selectors
- **Normal:** Uses Light Blue #60A5FA with a simple outline icon.
- **High Focus:** Uses Purple #8B5CF6 with a subtle glow (soft outer shadow in the same color) to indicate "Active/Urgent" status.

### Input Fields
- 16px radius, #F1F5F9 background, no border by default.
- On focus, add a 2px border of the Primary Blue.
- Use large, clear labels above the field.

### Bottom Navigation
- 0px radius on top, background #FFFFFF with a 1px top border (#F1F5F9).
- Use simple 24px stroke-based icons. Active state uses Primary Blue for both icon and label.

### Progress Bars
- 8px height, fully rounded. 
- Track color: #F1F5F9. 
- Fill color: Success Green (#10B981) for completed, Primary Blue for in-progress.