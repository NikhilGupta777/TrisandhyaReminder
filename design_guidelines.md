# Trisandhya Sadhana Companion - Design Guidelines

## Design Approach
**Hybrid System**: Material Design foundation with custom spiritual aesthetic. Combines Google's PWA best practices with serene, devotional visual language to create a meditation-focused utility app.

## Core Design Principles
1. **Spiritual Serenity**: Every interaction should feel calming and purposeful
2. **Ritual Clarity**: Clear visual hierarchy guides users through daily Sadhana practices
3. **Devotional Focus**: Minimize distractions, maximize spiritual immersion
4. **Offline Resilience**: Design for graceful offline states with cached spiritual content

---

## Color Palette

### Light Mode (Primary)
- **Primary Saffron**: 25 85% 55% - Sacred saffron for CTAs, active states, and devotional emphasis
- **Cream Base**: 40 25% 96% - Main background for peaceful reading
- **Soft Yellow**: 45 65% 88% - Subtle cards and elevated surfaces
- **Pure White**: 0 0% 100% - Input fields and content containers
- **Gentle Blue**: 205 55% 85% - Secondary accents for progress indicators
- **Deep Saffron**: 25 75% 45% - Text on light backgrounds, navigation
- **Charcoal**: 220 15% 25% - Primary text for optimal readability

### Dark Mode
- **Dark Base**: 220 20% 12% - Main background for evening Sandhya
- **Elevated Surface**: 220 18% 18% - Cards and panels
- **Muted Saffron**: 25 50% 65% - Primary actions in dark context
- **Warm White**: 40 10% 95% - Primary text
- **Dim Blue**: 205 30% 40% - Subtle accents and dividers

---

## Typography

**Font Stack**: 'Inter' for UI, 'Crimson Pro' for spiritual content headings
- **Hero/Deity Names**: Crimson Pro, 48px (mobile: 32px), semibold, letter-spacing -0.02em
- **Section Headers**: Inter, 28px (mobile: 22px), semibold
- **Sandhya Timings**: Inter, 20px, medium, tabular-nums for clock displays
- **Body Content**: Inter, 16px, regular, line-height 1.6 for scripture readings
- **Mantra Text**: Crimson Pro, 18px, italic for Sanskrit verses
- **UI Labels**: Inter, 14px, medium for buttons and form fields

---

## Spacing & Layout System

**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 24 for predictable rhythm
- Component padding: p-6 (mobile), p-8 (tablet), p-12 (desktop)
- Section spacing: py-16 (mobile), py-24 (desktop)
- Card gaps: gap-4 (tight grids), gap-6 (feature cards), gap-8 (media library)
- Container: max-w-7xl mx-auto for content width

---

## Component Library

### Navigation
- **Sticky Header**: Translucent cream background (backdrop-blur-lg), saffron logo, clean navigation links with hover states
- **Bottom Tab Bar** (Mobile PWA): 5 icons - Home, Guide, Media, Progress, Profile. Active state with saffron indicator

### Dashboard Elements
- **Greeting Card**: Large Crimson Pro "Jai Jagannath" with user name, subtle saffron glow effect
- **Live Clock**: Tabular numerals, 36px, centered with date below in muted text
- **Countdown Timer**: Circular progress ring (saffron fill) with center displaying "Next Pratah Sandhya in 5:23:15"
- **Sadhana Checklist**: Large checkboxes with soft shadows, saffron checkmarks, gentle scale animation on complete

### Alarm Interface
- **Full-Screen Modal**: Gradient overlay (dark base to transparent) over deity image
- **Deity Image**: Full-bleed background, subtle ken burns animation
- **Sandhya Title**: Centered, Crimson Pro 40px, warm white with subtle glow
- **Action Buttons**: 
  - Primary "Begin Sadhana": Saffron filled, white text, rounded-full, px-12 py-4
  - Secondary "Dismiss": Outline variant with blurred background (backdrop-blur-md)
- **Snooze Timer**: Bottom floating bar with simple +5 min increments

### Sadhana Tools
- **Jap Counter**: 
  - Circular tap button (200px diameter) with saffron gradient, pulsing glow on tap
  - Counter display above in large numerals (64px)
  - Session history below in subtle card
- **Mahapuran Tracker**: 
  - Calendar grid with completed days marked in gentle blue
  - Current chapter highlighted in saffron
  - Progress bar showing days completed

### Media Components
- **Audio Player**: Minimal controls, waveform visualization in saffron, playlist in expandable drawer
- **Video Cards**: 16:9 thumbnail, play icon overlay, pravachan title in Crimson Pro
- **Bhajan Grid**: Album art tiles, 3-column on desktop, 2-column tablet, 1-column mobile

### Progress Visualization
- **Streak Calendar**: Month view, completed days with saffron dot, current day outlined
- **Consistency Chart**: Simple line graph with gentle blue fill, saffron line, showing 30-day trend
- **Achievement Badges**: Circular icons with saffron glow for milestones (7-day, 30-day, 108-day streaks)

---

## Images & Iconography

**Icons**: Heroicons (outline style for navigation, solid for active states)

**Key Images**:
1. **Hero Section** (Homepage): Serene Lord Jagannath deity image (high-resolution, soft focus background) - 60vh height, gradient overlay bottom-to-top for text readability
2. **Alarm Screens**: Rotating collection of deity images (Lord Jagannath, temple architecture, sunrise/sunset) - full viewport, subtle vignette
3. **Section Dividers**: Minimalist lotus motifs, sacred geometry patterns in light opacity
4. **Empty States**: Peaceful illustrations (prayer beads, temple bells) with encouraging text

---

## Animations & Micro-interactions

**Minimal & Meaningful**:
- Sandhya countdown: Smooth number transitions (no jarring updates)
- Checklist completion: Gentle scale + saffron glow (200ms ease-out)
- Jap counter tap: Ripple effect + haptic feedback
- Page transitions: Subtle fade (150ms) for spiritual continuity
- Alarm appearance: Slow fade-in (800ms) for peaceful awakening
- NO scroll animations, NO parallax effects - maintain meditative stillness

---

## Accessibility & PWA Features

- Dark mode toggle in header (moon/sun icon)
- All interactive elements minimum 44px touch target
- Focus states: 2px saffron outline with 4px offset
- Offline indicator: Subtle banner with gentle blue background
- Install prompt: Modal with deity background, clear "Add to Home Screen" CTA
- Loading states: Saffron spinning lotus icon, never block content

---

## Responsive Breakpoints

- **Mobile** (< 768px): Single column, bottom navigation, stacked cards
- **Tablet** (768-1024px): 2-column grids, side navigation optional
- **Desktop** (> 1024px): Multi-column layouts, persistent sidebar for guides