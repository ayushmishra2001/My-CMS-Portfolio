# Design System: Devfolio CMS

This document defines the design guidelines, color palettes, typography, and UI component styling for the Devfolio CMS project.

## Colors

### Light Mode (Default)
* **Background**: `hsl(0, 0%, 100%)` / `#ffffff`
* **Foreground**: `hsl(222, 84%, 5%)` / `#0b0f19`
* **Primary (Accent)**: `hsl(221, 83%, 53%)` / `#1b71e7`
* **Primary Foreground**: `hsl(210, 40%, 98%)` / `#f8fafc`
* **Card Background**: `hsl(0, 0%, 100%)` / `#ffffff`
* **Card Foreground**: `hsl(222, 84%, 5%)` / `#0b0f19`
* **Border**: `hsl(214, 32%, 91%)` / `#e2e8f0`
* **Muted / Secondary**: `hsl(210, 40%, 96%)` / `#f1f5f9`
* **Muted Foreground**: `hsl(215, 16%, 47%)` / `#64748b`

### Dark Mode
* **Background**: `hsl(222, 84%, 5%)` / `#020617`
* **Foreground**: `hsl(210, 40%, 98%)` / `#f8fafc`
* **Primary (Accent)**: `hsl(221, 83%, 60%)` / `#3b82f6`
* **Primary Foreground**: `hsl(222, 47%, 11%)` / `#0f172a`
* **Card Background**: `hsl(217, 33%, 8%)` / `#0f172a`
* **Card Foreground**: `hsl(210, 40%, 98%)` / `#f8fafc`
* **Border**: `hsl(217, 33%, 17%)` / `#1e293b`
* **Muted / Secondary**: `hsl(217, 33%, 17%)` / `#1e293b`
* **Muted Foreground**: `hsl(215, 20% ,65%)` / `#94a3b8`

---

## Typography
* **Font Family**: Geist Sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Weights**: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700).

---

## UI Components & Design Language

### Cards
* Rounded borders with a radius of `0.5rem` (`var(--radius)`).
* Soft dark border (`border border-border`) instead of heavy shadows.
* Subtle hover effect: border transitions to `primary/50` or `primary/30`, and slightly scales up (`scale-102` or `scale-[1.01]`).

### Buttons
* **Primary Button**: Solid background (`bg-primary`), high contrast text (`text-primary-foreground`), hover transitions to `bg-primary/90`.
* **Secondary / Outline Button**: Bordered (`border border-border`), hover background transitions to `bg-accent` or `bg-secondary`.

### Navigation & Layouts
* Flexible grid systems (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
* Floating or fixed sidebars for the admin control panel with interactive menu tabs.
* Smooth scroll behaviors enabled.
