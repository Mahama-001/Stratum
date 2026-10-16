# UI Density, Styling & Viewport Invariants

When styling navigation bars, headers, and interactive controls in Stratum:

1. **Active State Accent Exclusivity**:
   - In segmented tabs, pill navigations, and toolbars, accent colors (`#0071e3`, `#2997ff`) must ONLY be applied to the currently active item:
     `${activeTab === 'CURRENT' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70 text-[#6e6e73] dark:text-[#86868b]'}`
   - Inactive items must never carry hardcoded accent or brand colors.

2. **Header Space Economy & Viewport Adaptation**:
   - Workstation and terminal top bars must be resilient across 1280px to 1920px+ viewports without horizontal clipping.
   - Utility controls (Sound Telemetry, Theme Toggle) must be compact icon-only circular buttons (`w-7 h-7 flex items-center justify-center rounded-full border`).
   - Auxiliary action labels (Tour, Copilot, Close Terminal) should show text only on `2xl` viewports (`hidden 2xl:inline`), falling back to clean icons on standard laptop resolutions.
   - Text capsules (account names, user emails) must specify defensive `truncate` with responsive `max-w-[...]`.

3. **Tailwind Multi-Stop Gradient Dark Mode Parity**:
   - When specifying 3-stop background gradients (`from-... via-... to-...`), ALWAYS specify `dark:via-...` alongside `dark:from-...` and `dark:to-...`. Never leave intermediate stops un-overridden in dark mode.
