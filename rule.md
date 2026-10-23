# TradeCopier Client Portal — UI & Frontend Engineering Rules

> **MANDATORY**: Follow these rules strictly for every UI modification, component creation, and styling decision across the entire project.

---

## 1. Bootstrap Class Rules — No Decimal Spacing Classes

> **CORE RULE**: **"No decimal numbers in Bootstrap classes (e.g. no gap-2.5, pt-2.5, mb-1.5 — use whole numbers like gap-2, pt-2, mb-1)"**

- **Why**: Standard Bootstrap 5 **only compiles integer values (0 to 5)** for spacing, margin, padding, and gap utilities. Decimal utility classes like `gap-2.5` or `pt-2.5` do not exist in Bootstrap's compiled CSS and fail silently, breaking layout spacing and alignment.
- **FORBIDDEN (DO NOT USE)**:
  - ❌ `gap-1.5`, `gap-2.5`
  - ❌ `pt-1.5`, `pt-2.5`, `pb-1.5`, `pb-2.5`
  - ❌ `mb-1.5`, `mb-2.5`, `mb-3.5`, `mt-1.5`, `me-1.5`, `ms-1.5`
  - ❌ `p-1.5`, `p-2.5`, `p-3.5`
  - ❌ `py-0.5`, `py-1.5`, `py-2.5`, `px-0.5`, `px-1.5`, `px-2.5`
- **REQUIRED (ALWAYS USE WHOLE NUMBERS)**:
  - ✅ `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-5`
  - ✅ `pt-1`, `pt-2`, `pt-3`, `pb-1`, `pb-2`, `pb-3`
  - ✅ `mb-1`, `mb-2`, `mb-3`, `mt-1`, `mt-2`, `me-1`, `me-2`, `ms-1`, `ms-2`
  - ✅ `p-1`, `p-2`, `p-3`, `p-4`, `p-5`
  - ✅ `py-1`, `py-2`, `py-3`, `px-1`, `px-2`, `px-3`, `px-4`
- If an exact custom sub-pixel or fractional spacing is strictly required for a special graphic/icon, use an inline style or CSS property (e.g. `style={{ padding: '6px 10px' }}` or `style={{ gap: '6px' }}`), NEVER write pseudo-Bootstrap decimal classes.

---

## 2. Color & High-Contrast Typography Rules
- **RULE 1: Never blend green on green.**
  - ❌ **NEVER** put dark green text on a dark green background.
  - ❌ **NEVER** put green text on green background (no `.badge.bg-success.text-success` or `.bg-success.text-black`).
- **RULE 2: Badge Specifications**:
  - **Solid Dark Green Badges** (Active Plan, Confirmed, Success):
    - `background-color: #15803d !important;`
    - `color: #ffffff !important;` (Crisp white text)
    - `font-weight: 700;`
  - **Light Mint Outline Badges**:
    - `background-color: #f0fdf4 !important;`
    - `color: #15803d !important;`
    - `border: 1px solid #86efac !important;`
    - `font-weight: 600;`
  - **Service Chips / Subtitles** (e.g. `Internal Trade Copier`, `ITC`):
    - `background-color: #f1f5f9;`
    - `color: #334155;`
    - `border: 1px solid #e2e8f0;`
    - `font-weight: 600;`

---

## 3. Border & Grid Alignment Rules
- **RULE**: Never apply arbitrary `border-bottom` dividers across multi-column responsive grid items (`col-sm-6`, `col-lg-3`).
  - Raw underlines in multi-column layouts cut across columns unevenly, disconnect at gutter boundaries, and awkwardly collide with container borders.
- **SOLUTION**: Use **Structured Specification Tiles (Micro-Cards)** or dedicated clean tables:
  - Each data item gets its own self-contained card/tile with:
    - Background: `#ffffff` or `#f8fafc`
    - Border: `1px solid #e2e8f0`
    - Rounded corners: `rounded-3` (8px)
    - Padding: `p-3`
    - Icon + small muted label on top, bold readable value below.

---

## 4. Reusable Pagination Standards
- **RULE**: Any table or list requiring pagination must use the universal component at:
  `src/components/common/Pagination.jsx`
- **Page Size Options**: Strictly `[10, 20, 50, 100, 200]` with default `10`.
- **Display**: Always show:
  - Total items summary: "Showing X to Y of Z records"
  - Rows per page dropdown (`10, 20, 50, 100, 200`)
  - Page navigation controls (`Prev`, numbered pages, `Next`, `Last`).
- **Dual-Safe Pagination**: If backend returns full batch in one response (e.g. 18 items when size is 10), slice client-side to ensure user only sees the selected page size, while keeping server offset params (`Param2`, `Param3`) active.

---

## 5. Tab & Component Scope Isolation
- **RULE**: Tab-specific UI elements (such as Promo Discount Banners or specific sub-navigation) must be strictly scoped to their respective view (e.g. `activeMainTab === 'packages'`).
- Do not let banners or alerts leak across unrelated views like "Invoices & Receipts" or "My Subscription".
