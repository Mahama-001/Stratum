# UI Contrast and Maximum Character Clarity

When designing, styling, or refactoring UI components in Stratum:
1. **Strict Visibility Standards**: Every text element, number, icon, and boundary must have maximum clarity in both Light and Dark themes.
2. **Contrast Invariants**:
   - **In Dark Mode**: Primary text must be high-luminance (`#ffffff` or `#f5f5f7`). Secondary text must not drop below `#d1d1d6` / `#e5e5ea`. Avoid faint grays (`#6e6e73` or opacity < 0.6) on dark surfaces.
   - **In Light Mode**: Primary text must be `#1d1d1f`. Secondary labels must be `#515154` or darker.
   - Form inputs and cards must have crisp, discernible borders (`border-white/[0.18]` in dark mode, `border-black/[0.12]` in light mode).
3. **Minimalist Institutional Hygiene**:
   - Keep headers and prompt cards concise; avoid unnecessary explanatory paragraphs under self-evident titles.
   - Do not add ornamental system status badges (e.g. `SYSTEM NOMINAL`) or engine implementation credits unless explicitly requested by the user.
