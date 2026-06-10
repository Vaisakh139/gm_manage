# GymPro — Theme Design System

> **Single source of truth** for all UI/UX design decisions, styling rules, and component specifications across the GymPro Gym Management System.

---

## Table of Contents

1. [Project Theme Overview](#1-project-theme-overview)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Shadows](#6-shadows)
7. [Buttons](#7-buttons)
8. [Forms](#8-forms)
9. [Authentication Pages](#9-authentication-pages)
10. [Cards](#10-cards)
11. [Navigation](#11-navigation)
12. [Modals & Popovers](#12-modals--popovers)
13. [Notifications](#13-notifications)
14. [Tables](#14-tables)
15. [Loading States](#15-loading-states)
16. [Animations](#16-animations)
17. [Responsive Design](#17-responsive-design)
18. [Accessibility Guidelines](#18-accessibility-guidelines)
19. [Component Examples](#19-component-examples)

---

## 1. Project Theme Overview

### Theme Name
**GymPro Dark-Accent**

### Design Philosophy
Clean, data-forward, and role-aware. The interface prioritises clarity for administrators managing high volumes of data, speed for trainers creating plans, and simplicity for members checking their status. A dark sidebar anchors the layout while a light content area keeps data readable. A bold red-rose accent provides energy and draws attention to primary actions.

### Target Users
| Role | Primary Need | Design Priority |
|---|---|---|
| **Admin** | Fast data management, reports | Dense tables, stats at a glance |
| **Trainer** | Create and update workout plans | Clean forms, member list |
| **Member** | View their own info | Simple cards, clear status |

### Visual Style Description
- **Layout:** Fixed dark sidebar + scrollable light main area
- **Mood:** Professional, energetic, trustworthy
- **Density:** Medium — not cramped, not too spacious
- **Aesthetic:** Modern SaaS — flat with subtle depth via shadows and borders
- **Accent:** Rose-red (`#e94560`) used sparingly for CTAs, active states, and highlights

---

## 2. Color System

### Primary Colors
| Token | HEX | Usage |
|---|---|---|
| `--primary-500` | `#e94560` | Primary CTA buttons, active sidebar links, key highlights |
| `--primary-600` | `#c73652` | Hover state for primary buttons |
| `--primary-700` | `#a52a42` | Active/pressed state for primary buttons |
| `--primary-100` | `#fde8ec` | Light primary background for badges, highlights |

### Secondary Colors
| Token | HEX | Usage |
|---|---|---|
| `--secondary-900` | `#1a1a2e` | Sidebar background, page-level dark backgrounds |
| `--secondary-800` | `#16213e` | Sidebar hover states, dark gradients |
| `--secondary-700` | `#0f3460` | Dark gradient accent, deep backgrounds |

### Accent Colors
| Token | HEX | Usage |
|---|---|---|
| `--accent-blue-500` | `#0ea5e9` | Info badges, blue stat cards |
| `--accent-blue-100` | `#dbeafe` | Blue badge backgrounds |
| `--accent-purple-500` | `#a855f7` | Purple stat cards, secondary highlights |
| `--accent-orange-500` | `#f97316` | Warning highlights, orange stat cards |

### Success Colors
| Token | HEX | Usage |
|---|---|---|
| `--success-500` | `#22c55e` | Success toasts, active badges, paid status |
| `--success-600` | `#16a34a` | Success text on light backgrounds |
| `--success-100` | `#dcfce7` | Success badge backgrounds |

### Warning Colors
| Token | HEX | Usage |
|---|---|---|
| `--warning-500` | `#eab308` | Warning toasts, pending status |
| `--warning-600` | `#ca8a04` | Warning text on light backgrounds |
| `--warning-100` | `#fef9c3` | Warning badge backgrounds |

### Error Colors
| Token | HEX | Usage |
|---|---|---|
| `--error-500` | `#ef4444` | Error toasts, danger buttons |
| `--error-600` | `#dc2626` | Error text, overdue status text |
| `--error-100` | `#fee2e2` | Error backgrounds, danger badge backgrounds |

### Neutral Grayscale Palette
| Token | HEX | Usage |
|---|---|---|
| `--gray-950` | `#030712` | Deepest dark |
| `--gray-900` | `#111827` | Dark text |
| `--gray-700` | `#374151` | Body text, table cell text |
| `--gray-500` | `#6b7280` | Secondary text, labels, placeholders |
| `--gray-400` | `#9ca3af` | Disabled text, empty states |
| `--gray-300` | `#d1d5db` | Input borders, dividers |
| `--gray-200` | `#e5e7eb` | Table row borders, light dividers |
| `--gray-100` | `#f3f4f6` | Hover backgrounds, table row hover |
| `--gray-50` | `#f9fafb` | Table header backgrounds, subtle fills |

### Background Colors
| Token | HEX | Usage |
|---|---|---|
| `--bg-page` | `#f0f2f5` | Main page background |
| `--bg-surface` | `#ffffff` | Cards, modals, inputs |
| `--bg-sidebar` | `#1a1a2e` | Sidebar background |
| `--bg-overlay` | `rgba(0,0,0,0.5)` | Modal overlays |

### Text Colors
| Token | HEX | Usage |
|---|---|---|
| `--text-primary` | `#1a1a2e` | Headings, important labels |
| `--text-body` | `#374151` | Default body copy, table data |
| `--text-muted` | `#6b7280` | Subtitles, secondary labels |
| `--text-disabled` | `#9ca3af` | Placeholder text, disabled states |
| `--text-inverse` | `#ffffff` | Text on dark backgrounds |
| `--text-sidebar` | `rgba(255,255,255,0.75)` | Inactive sidebar links |

### Border Colors
| Token | HEX | Usage |
|---|---|---|
| `--border-default` | `#e5e7eb` | Card borders, section dividers |
| `--border-input` | `#d1d5db` | Input default border |
| `--border-focus` | `#e94560` | Input focused border |
| `--border-error` | `#ef4444` | Input error border |
| `--border-success` | `#22c55e` | Input success border |
| `--border-sidebar` | `rgba(255,255,255,0.1)` | Sidebar internal dividers |

---

## 3. Typography

### Font Families
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```
- **Primary:** System sans-serif stack — loads instantly, matches OS feel
- **Monospace:** For code blocks, exercise lists, technical data

### Heading Styles

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---|---|---|---|---|---|
| `H1` | `32px / 2rem` | 800 | 1.2 | `-0.02em` | `--text-primary` |
| `H2` | `24px / 1.5rem` | 700 | 1.3 | `-0.01em` | `--text-primary` |
| `H3` | `20px / 1.25rem` | 600 | 1.4 | `0` | `--text-primary` |
| `H4` | `18px / 1.125rem` | 600 | 1.4 | `0` | `--text-primary` |
| `H5` | `16px / 1rem` | 600 | 1.5 | `0` | `--text-body` |
| `H6` | `14px / 0.875rem` | 600 | 1.5 | `0.01em` | `--text-muted` |

### Body Text Styles
| Style | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Body Large | `16px` | 400 | 1.6 | Main content paragraphs |
| Body Default | `14px` | 400 | 1.5 | Table data, form values, general UI |
| Body Small | `13px` | 400 | 1.5 | Supporting info, secondary labels |

### Small Text Styles
| Style | Size | Weight | Usage |
|---|---|---|---|
| Caption | `12px` | 400 | Timestamps, metadata |
| Label | `13px` | 500 | Form labels, column headers |
| Badge | `12px` | 500 | Status badges, tags |
| Overline | `11px` | 600, uppercase | Sidebar section headers |

### Font Weights
```
300 — Light      (rarely used)
400 — Regular    (body text)
500 — Medium     (labels, badges, buttons)
600 — SemiBold   (headings H3–H6, column headers)
700 — Bold       (H2, important values)
800 — ExtraBold  (H1, stat values, brand name)
```

### Line Heights
```
--leading-tight:   1.2   (headings)
--leading-snug:    1.35  (subheadings)
--leading-normal:  1.5   (body)
--leading-relaxed: 1.625 (long-form text)
```

### Letter Spacing
```
--tracking-tight:  -0.02em  (H1)
--tracking-snug:   -0.01em  (H2)
--tracking-normal:  0       (body)
--tracking-wide:    0.01em  (H5, H6)
--tracking-wider:   0.05em  (overline / section labels)
--tracking-widest:  0.1em   (all-caps labels)
```

---

## 4. Spacing System

### 4px Base Scale
```
--space-0:   0px
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

### Margin Guidelines
| Context | Value |
|---|---|
| Between sections on a page | `32px` |
| Between cards in a grid | `20px` |
| Between form groups | `16px` |
| Between a label and its input | `6px` |
| Between table rows | `0` (border-bottom handles separation) |
| Modal content top margin | `24px` |

### Padding Guidelines
| Component | Padding |
|---|---|
| Page content area | `32px` |
| Card | `24px` |
| Modal | `32px` |
| Button (default) | `9px 18px` |
| Button (small) | `5px 12px` |
| Input | `9px 12px` |
| Table cell | `12px 16px` |
| Table header | `12px 16px` |
| Sidebar link | `10px 20px` |
| Badge | `3px 10px` |
| Toast notification | `14px 18px` |

### Container Widths
```
--container-xs:   480px   (auth forms, dialogs)
--container-sm:   640px   (small modals)
--container-md:   768px   (medium modals, profile pages)
--container-lg:  1024px   (main content max-width on large screens)
--container-xl:  1280px   (full-width dashboard layout)
--container-full: 100%    (tables, full-bleed sections)
```

### Responsive Breakpoints
```
--bp-xs:    480px   (small phones)
--bp-sm:    640px   (large phones)
--bp-md:    768px   (tablets)
--bp-lg:   1024px   (small laptops)
--bp-xl:   1280px   (desktops)
--bp-2xl:  1536px   (large monitors)
```

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Badges, tags, small chips |
| `--radius-md` | `8px` | Buttons, inputs, dropdowns |
| `--radius-lg` | `12px` | Cards, modals, stat boxes |
| `--radius-xl` | `16px` | Login card, large panels |
| `--radius-2xl` | `24px` | Feature cards, hero sections |
| `--radius-full` | `9999px` | Pill badges, avatar circles, toggle switches |

---

## 6. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Input focus rings, subtle borders |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.06)` | Cards, panels, standard surface depth |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.10)` | Dropdowns, popovers, floating elements |
| `--shadow-xl` | `0 20px 60px rgba(0,0,0,0.18)` | Modals, drawers |
| `--shadow-login` | `0 20px 60px rgba(0,0,0,0.30)` | Login card over dark gradient background |
| `--shadow-none` | `none` | Flat elements, disabled states |

---

## 7. Buttons

### Primary Button
```
Background:   #e94560  (--primary-500)
Text:         #ffffff
Border:       none
Border Radius: 8px
Padding:      9px 18px
Font:         14px / 500
Hover:        background → #c73652  (--primary-600)
Active:       background → #a52a42, transform: scale(0.98)
Disabled:     opacity: 0.5, cursor: not-allowed
Loading:      opacity: 0.8, cursor: wait, show spinner inside
```

### Secondary Button
```
Background:   #f3f4f6  (--gray-100)
Text:         #374151  (--gray-700)
Border:       none
Border Radius: 8px
Padding:      9px 18px
Hover:        background → #e5e7eb  (--gray-200)
Active:       background → #d1d5db, transform: scale(0.98)
Disabled:     opacity: 0.5, cursor: not-allowed
Loading:      opacity: 0.8, cursor: wait
```

### Outline Button
```
Background:   transparent
Text:         #e94560  (--primary-500)
Border:       1.5px solid #e94560
Border Radius: 8px
Padding:      9px 18px
Hover:        background → #fde8ec, border-color → #c73652
Active:       background → #fbd0d8, transform: scale(0.98)
Disabled:     opacity: 0.4, cursor: not-allowed
Loading:      opacity: 0.7, cursor: wait
```

### Ghost Button
```
Background:   transparent
Text:         #6b7280  (--gray-500)
Border:       none
Border Radius: 8px
Padding:      9px 18px
Hover:        background → #f3f4f6, text → #374151
Active:       background → #e5e7eb, transform: scale(0.98)
Disabled:     opacity: 0.4, cursor: not-allowed
```

### Danger Button
```
Background:   #fee2e2  (--error-100)
Text:         #dc2626  (--error-600)
Border:       none
Border Radius: 8px
Padding:      9px 18px
Hover:        background → #fecaca
Active:       background → #fca5a5, transform: scale(0.98)
Disabled:     opacity: 0.5, cursor: not-allowed
Loading:      opacity: 0.8, cursor: wait
```

### Button Sizes
```
Large:    padding 12px 24px  |  font-size 15px
Default:  padding 9px 18px   |  font-size 14px
Small:    padding 5px 12px   |  font-size 13px
Icon:     padding 9px        |  square, icon only
```

---

## 8. Forms

### Text Inputs & Textareas
```
Background:     #ffffff
Border:         1px solid #d1d5db  (--border-input)
Border Radius:  8px
Padding:        9px 12px
Font Size:      14px
Font Color:     #374151
Placeholder:    #9ca3af

Focus:
  border-color: #e94560
  outline: none
  box-shadow: 0 0 0 3px rgba(233,69,96,0.12)

Error:
  border-color: #ef4444
  box-shadow: 0 0 0 3px rgba(239,68,68,0.12)

Success:
  border-color: #22c55e
  box-shadow: 0 0 0 3px rgba(34,197,94,0.12)

Disabled:
  background: #f9fafb
  color: #9ca3af
  cursor: not-allowed
```

### Select Dropdowns
```
Same as text input + custom chevron icon
Appearance: none (removes native arrow)
Background-image: SVG chevron-down icon (#9ca3af)
Cursor: pointer
```

### Radio Buttons
```
Custom styled circle
Size: 16px × 16px
Border: 2px solid #d1d5db
Border Radius: 50%

Checked:
  border-color: #e94560
  background: radial-gradient(circle, #e94560 40%, transparent 40%)

Focus:
  box-shadow: 0 0 0 3px rgba(233,69,96,0.15)
```

### Checkboxes
```
Custom styled square
Size: 16px × 16px
Border: 2px solid #d1d5db
Border Radius: 4px

Checked:
  background: #e94560
  border-color: #e94560
  checkmark: white SVG

Focus:
  box-shadow: 0 0 0 3px rgba(233,69,96,0.15)
```

### Labels
```
Font Size:    13px
Font Weight:  500
Color:        #374151
Margin-bottom: 6px
Display:      block
```

### Required Indicators
```
Content:  " *"
Color:    #e94560
Font:     inherit
```

### Validation Messages
```
Font Size:  12px
Margin-top: 5px
Display:    flex
Gap:        4px (icon + text)

Error:   color #dc2626, icon ⚠
Success: color #16a34a, icon ✓
Hint:    color #6b7280, icon ℹ
```

---

## 9. Authentication Pages

### Login Page

**Layout**
```
Full viewport: min-height 100vh
Display: flex, align-items center, justify-content center
Background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
```

**Card**
```
Width:          420px (max-width: 95vw on mobile)
Background:     #ffffff
Border Radius:  16px
Padding:        48px
Shadow:         0 20px 60px rgba(0,0,0,0.30)
```

**Logo/Brand Section**
```
Text Align:   center
Margin-bottom: 32px
H1:           font-size 28px, weight 800, color #e94560
Subtitle:     font-size 14px, color #6b7280, margin-top 4px
```

**Form**
```
Full-width inputs, stacked vertically
Gap between form groups: 16px
Submit button: full width, margin-top 8px
```

**Default credentials hint**
```
Text Align:   center
Font Size:    13px
Color:        #6b7280
Margin-top:   16px
```

---

### Signup Page
Same card and background as Login.
Additional fields: First Name, Last Name (side by side in 2-column row), Role selector.
Terms checkbox at bottom before submit.

---

### Forgot Password Page
Same card layout, narrower content.
Single email input + "Send Reset Link" primary button.
Back-to-login ghost link below button.

---

### Reset Password Page
Same card layout.
Two password inputs (new password + confirm).
Password strength indicator bar below first input:
- Weak: red fill
- Medium: orange fill
- Strong: green fill

---

## 10. Cards

### Standard Card
```
Background:     #ffffff
Border Radius:  12px
Padding:        24px
Shadow:         0 2px 8px rgba(0,0,0,0.06)
Margin-bottom:  24px
Border:         none
Hover:          no change (static surface)
```

### Feature Card
```
Same as standard +
Border-top: 4px solid [accent color]
Hover: box-shadow → 0 8px 24px rgba(0,0,0,0.10), translateY(-2px)
Transition: all 0.2s ease
```

### Dashboard Stat Card
```
Background:     #ffffff
Border Radius:  12px
Padding:        24px
Shadow:         0 2px 8px rgba(0,0,0,0.06)
Border-left:    4px solid [role color]

Colors:
  Default: #e94560 (primary)
  .blue:   #0ea5e9
  .green:  #22c55e
  .purple: #a855f7
  .orange: #f97316

Stat Value:
  Font Size:   32px
  Font Weight: 700
  Color:       #1a1a2e

Stat Label:
  Font Size:   13px
  Color:       #6b7280
  Margin-top:  4px
```

### Statistics Card (detailed)
```
Same as dashboard stat card +
Optional trend indicator:
  ↑ Positive: color #16a34a
  ↓ Negative: color #dc2626
  Font Size:  12px, weight 500
Optional sparkline chart area at bottom
```

---

## 11. Navigation

### Sidebar
```
Width:      240px
Background: #1a1a2e
Position:   fixed, left 0, top 0, height 100vh
z-index:    100
Display:    flex, flex-direction column
```

**Logo Area**
```
Padding:        24px 20px
Font Size:      20px
Font Weight:    700
Color:          #e94560
Border-bottom:  1px solid rgba(255,255,255,0.1)
```

**Nav Links**
```
Padding:      10px 20px
Font Size:    14px
Color:        rgba(255,255,255,0.75)
Border-left:  3px solid transparent
Gap (icon + label): 10px
Transition:   all 0.2s

Hover / Active:
  Background:   rgba(233,69,96,0.15)
  Color:        #ffffff
  Border-left:  3px solid #e94560
```

**Section Headers (Overline)**
```
Padding:          8px 20px 4px
Font Size:        11px
Text-transform:   uppercase
Letter Spacing:   0.1em
Color:            rgba(255,255,255,0.4)
Margin-top:       8px
```

**Footer Area**
```
Padding:        16px 20px
Border-top:     1px solid rgba(255,255,255,0.1)
User email:     font-size 12px, color rgba(255,255,255,0.6)
Logout button:  ghost style, full width
```

---

### Topbar
```
Background:     #ffffff
Padding:        16px 32px
Border-bottom:  1px solid #e8e8e8
Font Size:      20px
Font Weight:    600
Color:          #1a1a2e
Position:       sticky top 0, z-index 50
```

---

### Mobile Navigation (≤768px)
```
Sidebar becomes off-canvas drawer
Hamburger button in top-left of topbar
Overlay behind open drawer: rgba(0,0,0,0.5)
Drawer slide-in from left: 0.25s ease
Close on overlay click or swipe-left
```

---

### Breadcrumbs
```
Font Size:      13px
Color (trail):  #6b7280
Color (current): #1a1a2e
Separator:      "/" with margin 0 8px
Hover (links):  color #e94560, text-decoration underline
```

---

## 12. Modals & Popovers

### Modal
```
Overlay:
  Position: fixed inset 0
  Background: rgba(0,0,0,0.5)
  z-index: 1000
  Backdrop-filter: blur(2px)
  Display: flex, align-items center, justify-content center

Container:
  Background:     #ffffff
  Border Radius:  12px
  Padding:        32px
  Width:          560px (max-width: 95vw)
  Max-height:     90vh
  Overflow-y:     auto
  Shadow:         0 20px 60px rgba(0,0,0,0.18)

Title:
  Font Size:    18px
  Font Weight:  600
  Margin-bottom: 24px

Actions row:
  Display:         flex
  Gap:             12px
  Justify-content: flex-end
  Margin-top:      24px

Animation:
  Entry: fade-in + scale(0.95 → 1.0), duration 0.2s, ease-out
  Exit:  fade-out + scale(1.0 → 0.95), duration 0.15s, ease-in
```

### Drawer (Side Panel)
```
Position:   fixed, right 0, top 0, height 100vh
Width:      480px (max-width: 100vw)
Background: #ffffff
Shadow:     -8px 0 32px rgba(0,0,0,0.15)
z-index:    1000
Padding:    32px

Animation:
  Entry: slide in from right, 0.3s ease-out
  Exit:  slide out to right, 0.25s ease-in
```

### Confirmation Dialog
```
Same as modal, width 400px
Icon centered at top (warning/danger colored)
Short message text (1–2 lines), centered
Two buttons: Cancel (secondary) + Confirm (danger or primary)
Cannot be dismissed by clicking overlay
```

### Tooltips
```
Background:     #1a1a2e
Color:          #ffffff
Font Size:      12px
Padding:        6px 10px
Border Radius:  6px
Shadow:         0 4px 12px rgba(0,0,0,0.15)
Max-width:      200px
z-index:        2000
Pointer-events: none

Arrow: 6px triangle in same background color
Delay: 300ms show, 100ms hide
Animation: fade-in 0.15s
```

### Popovers
```
Background:     #ffffff
Border:         1px solid #e5e7eb
Border Radius:  10px
Shadow:         0 8px 24px rgba(0,0,0,0.12)
Padding:        16px
Max-width:      320px
z-index:        1500

Animation: fade-in + translateY(-4px → 0), 0.15s ease-out
Dismiss: click outside, Escape key
```

### Accessibility — Modals
- Trap focus inside open modal
- Return focus to trigger element on close
- `role="dialog"` and `aria-modal="true"` on container
- `aria-labelledby` pointing to modal title
- Escape key closes all modals and popovers

---

## 13. Notifications (Toasts)

### Positioning
```
Fixed, bottom-right corner
Bottom: 24px, Right: 24px
z-index: 9999
Display: flex, flex-direction: column, gap: 10px
```

### Shared Toast Styles
```
Width:          360px (max-width: 95vw)
Padding:        14px 18px
Border Radius:  10px
Shadow:         0 4px 16px rgba(0,0,0,0.12)
Display:        flex, align-items flex-start, gap 12px
Font Size:      14px
Border-left:    4px solid [type color]
Background:     #ffffff
```

### Toast Types
| Type | Border Color | Icon | Title Color |
|---|---|---|---|
| **Success** | `#22c55e` | ✓ (green) | `#16a34a` |
| **Error** | `#ef4444` | ✕ (red) | `#dc2626` |
| **Warning** | `#eab308` | ⚠ (amber) | `#ca8a04` |
| **Info** | `#0ea5e9` | ℹ (blue) | `#0284c7` |

### Animation
```
Entry:    slide in from right + fade-in, 0.3s ease-out
Exit:     slide out to right + fade-out, 0.25s ease-in
Progress bar at bottom showing time remaining
```

### Auto-dismiss
```
Success:  3000ms
Info:     4000ms
Warning:  5000ms
Error:    persists until manually closed (or 8000ms)
Close button: top-right × , always visible
Hover pauses the auto-dismiss timer
```

---

## 14. Tables

### Header
```
Background:   #f9fafb  (--gray-50)
Padding:      12px 16px
Font Size:    14px
Font Weight:  600
Color:        #374151
Border-bottom: 1px solid #e5e7eb
Text-align:   left
White-space:  nowrap
```

### Rows
```
Padding:       12px 16px
Font Size:     14px
Color:         #374151
Border-bottom: 1px solid #f3f4f6
Transition:    background 0.15s

Hover:
  Background: #fafafa

Selected:
  Background: #fde8ec
  Border-left: 3px solid #e94560
```

### Sorting Indicators
```
Column header cursor: pointer
Sort icon: ↕ (neutral) → ↑ (asc) → ↓ (desc)
Active sort column: color #e94560, font-weight 700
Icon size: 14px, inline after label with 6px gap
```

### Pagination
```
Display:          flex, align-items center, gap 4px
Justify-content:  flex-end
Margin-top:       20px
Font Size:        14px

Page button:
  Width:          36px
  Height:         36px
  Border Radius:  8px
  Background:     transparent
  Color:          #6b7280

  Hover:  background #f3f4f6, color #374151
  Active: background #e94560, color #ffffff
  Disabled: opacity 0.4, cursor not-allowed

Items-per-page select: standard input style, width auto
Info text: "Showing 1–20 of 150", color #6b7280
```

### Status Badges in Tables
```
display: inline-block
padding: 3px 10px
border-radius: 9999px
font-size: 12px
font-weight: 500

Active / Paid:    bg #dcfce7,  text #16a34a
Inactive / Overdue: bg #fee2e2, text #dc2626
Pending:          bg #fef9c3,  text #ca8a04
Info:             bg #dbeafe,  text #2563eb
```

---

## 15. Loading States

### Skeleton Loaders
```
Background:    linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)
Background-size: 400% 100%
Animation:     shimmer 1.5s infinite linear
Border Radius: same as element being replaced

Skeleton line heights:
  Heading:   20px, width 40%
  Body line: 14px, width 100% / 80% / 60% (alternating)
  Avatar:    40px × 40px, border-radius 50%
  Card:      full card height with internal skeleton rows
```

### Spinners
```
Size variants:
  Small:   16px × 16px (inline, inside buttons)
  Default: 24px × 24px (content areas)
  Large:   48px × 48px (full-section loading)

Style: border-based CSS spinner
  Border:       3px solid #f3f4f6
  Border-top:   3px solid #e94560
  Border-radius: 50%
  Animation:    spin 0.8s linear infinite

Overlay spinner (full card/section):
  Background: rgba(255,255,255,0.75)
  Display:    flex, align-items center, justify-content center
  Position:   absolute inset 0
```

### Progress Bars
```
Height:         6px
Background:     #f3f4f6
Border Radius:  9999px
Overflow:       hidden

Fill:
  Background: #e94560
  Height:     100%
  Transition: width 0.4s ease
  Border-radius: 9999px

Indeterminate variant:
  Animation: progress-indeterminate 1.5s infinite ease-in-out
  Width: 40%, slides left-to-right
```

---

## 16. Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
Duration:  0.2s
Easing:    ease-out
Usage:     Page content, modal overlay, toast entry
```

### Fade Out
```css
@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
Duration:  0.15s
Easing:    ease-in
Usage:     Toast exit, modal dismiss
```

### Slide Up
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
Duration:  0.25s
Easing:    ease-out
Usage:     Cards entering viewport, page sections loading
```

### Slide Down
```css
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(16px); }
}
Duration:  0.2s
Easing:    ease-in
Usage:     Dropdown close, accordion collapse
```

### Slide In from Right
```css
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}
Duration:  0.3s
Easing:    ease-out
Usage:     Toast entry, drawer open
```

### Scale Animation
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1.0); }
}
Duration:  0.2s
Easing:    ease-out
Usage:     Modal entry, popover open, dropdown open
```

### Shimmer (Skeleton)
```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
Duration:  1.5s
Easing:    linear
Iteration: infinite
```

### Spin (Loader)
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
Duration:  0.8s
Easing:    linear
Iteration: infinite
```

### Page Transitions
```
Route change entry:
  Animation: fadeIn + slideUp combined
  Duration:  0.3s
  Easing:    ease-out

Stagger children (dashboard cards):
  Each child delays by: index × 0.05s
  Max stagger:          0.3s total
```

### Global Animation Rules
```css
/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Standard transition for interactive elements */
--transition-fast:   0.15s ease
--transition-normal: 0.2s ease
--transition-slow:   0.3s ease
```

---

## 17. Responsive Design

### Mobile (< 640px)
```
Sidebar:
  Hidden by default
  Opens as full-height overlay drawer
  Hamburger icon in topbar

Layout:
  Single column
  No fixed sidebar — full width content
  Topbar sticks to top

Tables:
  Horizontal scroll on overflow
  Minimum column widths enforced
  Action buttons → icon-only (no text)

Cards & grids:
  Single column, full width
  Stat cards: 2-column grid minimum

Modals:
  Full screen (bottom sheet style on mobile)
  Slide up from bottom
  Width: 100%, border-radius only on top corners

Forms:
  Form rows collapse to single column
  Inputs full width
  Buttons full width
```

### Tablet (640px – 1024px)
```
Sidebar:
  Can be collapsed to icon-only (64px wide)
  Toggle button in topbar

Layout:
  Sidebar (collapsed or icon) + content
  Content: full remaining width

Tables:
  Scroll if needed, some columns may hide (less important ones)

Cards & grids:
  2-column stat grid
  2-column form rows preserved

Modals:
  Width: 90vw, max-width: 560px
```

### Desktop (1024px – 1280px)
```
Sidebar: Full 240px, always visible
Content: Full layout, all columns visible
Grids: 3–4 column stat cards
Tables: All columns shown
Forms: 2-column rows
Modals: Fixed widths (400px, 560px)
```

### Large Screens (> 1280px)
```
Content area max-width: 1280px, centered with auto margins
Sidebar remains 240px
Stat grids: up to 4–6 columns
Table rows: comfortable padding
No horizontal scroll anywhere
```

---

## 18. Accessibility Guidelines

### Contrast Ratios
| Pair | Ratio | Standard |
|---|---|---|
| `#374151` text on `#ffffff` | 10.2:1 | ✅ AAA |
| `#1a1a2e` text on `#ffffff` | 15.3:1 | ✅ AAA |
| `#ffffff` text on `#e94560` | 4.6:1 | ✅ AA |
| `#6b7280` text on `#ffffff` | 4.7:1 | ✅ AA (large text) |
| `#ffffff` text on `#1a1a2e` | 15.3:1 | ✅ AAA |
| Badge text on badge background | ≥ 4.5:1 | ✅ AA enforced |

### Keyboard Navigation
- All interactive elements reachable via `Tab`
- Logical tab order follows visual reading order
- Modals trap focus; Escape closes them
- Sidebar links navigable with `Tab` + `Enter`
- Table column sort triggers on `Enter` or `Space`
- Dropdown/select operable via arrow keys

### Focus Indicators
```
All focusable elements:
  outline: none (remove default)
  box-shadow: 0 0 0 3px rgba(233,69,96,0.35)
  border-radius: matches element's own radius

Exception — buttons:
  outline: 2px solid #e94560
  outline-offset: 2px

Never remove focus indicator without replacement
```

### Screen Reader Support
- All images have `alt` text or `aria-hidden="true"` if decorative
- Icon-only buttons have `aria-label`
- Status badges use `aria-label` (e.g. `aria-label="Status: Active"`)
- Form inputs linked to labels via `htmlFor` / `id`
- Error messages linked via `aria-describedby`
- Loading states announced via `aria-live="polite"`
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tables: `<caption>` or `aria-label`, `scope` on header cells
- Toast notifications: `role="status"` or `role="alert"` depending on urgency

### Color Independence
- Never use color alone to convey meaning (always pair with icon or text)
- Payment status: badge text + colour, not colour alone
- Form errors: red border + error icon + message text

---

## 19. Component Examples

### Dashboard (Admin)
```
Page layout:
  Topbar: "Dashboard"
  Content: 32px padding

Row 1 — Stat cards grid (auto-fill, min 200px)
  [Total Members]   .blue card
  [Active Members]  .green card
  [Trainers]        .purple card
  [Pending Payments] .orange card
  [Total Revenue]   .green card
  [Active Workout Plans] .blue card

Row 2 — Quick Overview card
  Standard card with summary table (label : value pairs)
  No actions needed

Spacing between rows: 32px
```

### Members / Trainers / Plans List Page
```
Single card filling content width

Header row (inside card):
  Left:  h2 title "Members"
  Right: "+ Add Member" primary button

Table:
  Standard table styles
  Last column: action buttons (Edit = secondary-sm, Delete = danger-sm)
  Status column: badge

Empty state (no rows):
  Centered text + icon, color --gray-400

Modal (add/edit):
  Width: 560px
  Form rows: 2-column where sensible
  Actions: Cancel (secondary) + Save (primary)
```

### User Profile Page (Member)
```
Single card, max-width 600px, not full-width

Title: "My Profile"
Content: definition-list style rows
  Each row: label (140px, muted) + value (bold)
  Separator: 1px border-bottom, padding-bottom 12px

No edit capability for member (read-only)
```

### Membership Details Page
```
Two elements:
  1. Stat card (.blue) showing plan name as the value
  2. Detail rows: Join Date, Expiry Date, Status (badge)

If no plan assigned:
  Empty state message inside card
```

### Workout Plan Page (Member)
```
Active plan: card with green left-border (4px solid #22c55e)
  Title row: plan name (bold 16px) + Active badge (right)
  Trainer name: small muted text
  Description paragraph
  Exercises: monospace-style preformatted block,
             background #f9fafb, border-radius 8px, padding 16px
  Date row: Start / End in muted 13px

Previous plans: standard card, same layout, Completed badge (red)
```

### Payments / Payment History Page
```
Admin view:
  Full table with all columns
  Filter/sort by status possible
  Add Payment button opens modal

Member view:
  2 stat cards at top (Total Paid + Pending count)
  Read-only table below
  No add/edit actions
```

### Settings Page (future)
```
Vertical tabs on left (200px) + content panel on right
Tab items: Profile, Password, Notifications, Appearance
Each section: card with form fields + Save button at bottom
Destructive actions (Delete Account) in a separate danger zone card
at the very bottom with red border-left accent
```

---

*Last updated: 2026-06-10 | GymPro Design System v1.0*
