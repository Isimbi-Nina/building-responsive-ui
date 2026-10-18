# SpendSmart – Student Finance Tracker

A small, dependency-free web app that helps a student record what they spend, search and sort their transactions, and see totals at a glance. It is built with plain HTML, CSS and JavaScript (ES modules). There is no framework and no build step.

| | |
|---|---|
| **Live app** | https://isimbi-nina.github.io/building-responsive-ui/ |
| **Video demo** | https://www.loom.com/share/8e1f4ff5382a41969ede53cfd6598d23 |
| **Author** | Isimbi-Nina · h.isimbi@alustudent.com |

## Theme

Personal finance for students. Every amount is saved in **Rwandan francs (FRW)**. USD and EUR exist only as a *display* currency, so editing, sorting and the spending cap always work on one consistent number.

## Features

- **Five sections on one page:** About, Dashboard, Records, New entry, Settings. Only one is visible at a time.
- **Dashboard:** transaction count, total spent, top category, a 7-day bar chart (today and the previous 6 days), and a spending-cap message.
  - Under the cap: a polite live-region message.
  - Over the cap: an assertive live-region message.
- **Records:** table on tablet and desktop, stacked cards on phones.
  - Sort by date, description or amount. Each click flips ascending and descending.
  - Live regex search with an "ignore case" option and matches highlighted in yellow.
  - Edit and delete (with a confirmation) on every record.
- **New entry / edit form:** one form for both. Editing fills the fields and the button changes to "Update transaction".
- **Settings:**
  - Spending cap, manual exchange rates (FRW is fixed at 1, USD and EUR editable) and display currency.
  - Add and remove categories. A category that transactions still use cannot be removed.
  - **Import** and **Export** records as JSON.
- **Saved in the browser** with `localStorage`. The first visit loads 13 starter transactions from `seed.json`.

## Run it locally

The app uses ES modules and `fetch("seed.json")`, so it **must be served over HTTP**. Opening `index.html` by double-clicking it (a `file://` address) will not work.

Pick one:

- **VS Code / Cursor:** install the *Live Server* extension, then right-click `index.html` → *Open with Live Server*.
- **Node:** run `npx http-server -p 8080` in the project folder, then open `http://localhost:8080`.
- **Python:** run `python -m http.server 8080`, then open `http://localhost:8080`.

To reset to the starter data, delete the `finance:records` and `finance:settings` keys in DevTools → Application → Local Storage, then reload.

## Project structure

```text
index.html          the whole app (all five sections)
tests.html          pass/fail checks for the validators and search
seed.json           13 starter transactions
styles/main.css     mobile-first layout, one chart animation
scripts/
  validators.js     regex rules for the form and settings
  search.js         safe regex compile, HTML escaping, match highlighting
  storage.js        localStorage, seed loading, JSON import/export
  state.js          records, settings, sort, stats (add / edit / delete)
  ui.js             draws the page from the data
  app.js            connects buttons and inputs to the other files
```

Each file does one job:

```text
app.js ─► validators.js
       ─► state.js ─► (data)
       ─► storage.js
       ─► search.js
       ─► ui.js
```

## Data model

One record:

```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 3500,
  "category": "Food",
  "date": "2026-10-18",
  "createdAt": "2026-10-18T10:00:00.000Z",
  "updatedAt": "2026-10-18T10:00:00.000Z"
}
```

Ids are `txn_0001`, `txn_0002`, and so on (highest number in use + 1).

Two `localStorage` keys:

| Key | Contents |
|---|---|
| `finance:records` | the array of records |
| `finance:settings` | `baseCurrency`, `rates`, `displayCurrency`, `cap`, `categories` |

## Regex catalog

All form rules live in `scripts/validators.js`. Errors appear under the field as you type.

| Field | Pattern | Accepts | Rejects |
|---|---|---|---|
| Description (edges) | `/^\S(?:.*\S)?$/` | `Lunch` | ` Lunch`, `Lunch ` |
| Description (double space) | `/\s{2,}/` (a match is an error) | `Lunch at cafe` | `Lunch  at cafe` |
| Description (repeated word, back-reference) | `/\b(\w+)\s+\1\b/i` (a match is an error) | `Coffee with friends` | `coffee coffee` |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | `0`, `12`, `12.5`, `12.50` | `01`, `12.345`, `-5` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` plus a real-calendar check | `2024-02-29` | `2025-02-31`, `2025-13-01` |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Food`, `Bus Pass` | `food1`, `Bus  Pass` |
| Exchange rate | `/^(?:\d+\.?\d*\|\.\d+)$/` and greater than 0 | `0.00069`, `1.2` | `0`, `abc` |

### Regex search

The Records search box takes any JavaScript regular expression.

- A pattern that does not compile (for example `(coffee`) shows **"Invalid pattern"** and leaves the list unchanged.
- The "Ignore case" checkbox adds the `i` flag.
- Text is HTML-escaped before matches are wrapped in `<mark>`, so descriptions can never inject markup, and screen readers still read the full text.

Example buttons fill the box for you:

| Button | Pattern | Finds |
|---|---|---|
| Cents | `\.\d{2}\b` | amounts written with cents |
| Drinks | `[Cc]offee\|[Tt]ea` | coffee and tea purchases |
| Repeated word | `\b(\w+)\s+\1\b` | descriptions with a doubled word |

## Import and export

- **Export** downloads `finance-records.json`.
- **Import** replaces all records, but only if *every* record is valid. Each record is checked with the same rules as the form, ids must be unique, and one bad record rejects the whole file with a message such as `Invalid record 3: …`. Nothing changes on failure.
- Categories used by imported records are added to Settings automatically.

## Accessibility

- **Skip link** at the top jumps to `#main`.
- **Semantic structure:** `header`, `nav`, `main`, one `section` per page, `footer`, and a real `<table>` with `<caption>` and `scope="col"`.
- **Labels and errors:** every input has a `<label for>`, and errors are tied to their field with `aria-describedby` and `aria-invalid`.
- **Live regions:** the footer `role="status"` line announces "Saved", "Imported 12 records", "Invalid JSON", and so on. Cap messages use polite and assertive live regions, and only one is filled at a time.
- **Focus:** switching sections moves focus to that section's heading. Buttons have 44px tap targets.
- **Contrast:** dark text on a light background.
- **Motion:** the one chart animation is switched off for users with `prefers-reduced-motion`.

## Responsive design

Mobile-first, starting at about 360px wide:

| Width | Layout |
|---|---|
| Phone | one column, records as cards |
| 768px+ | records as a table, two-column dashboard |
| 1024px+ | centred maximum width, stat cards in one row |

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | move between controls |
| `Enter` / `Space` | press a button |
| `Tab` on page load, then `Enter` | use the skip link to jump to the main content |
| `Enter` in the New category box | add the category |
| `Enter` in any form field | submit that form |

## Tests

Open `tests.html` through the local server (not as a file). It runs plain pass/fail checks and prints the result on the page.

- **Validators:** valid and invalid amount, date (including `2025-02-31`), category, and description (edge spaces, double spaces, repeated word).
- **Search:** an invalid pattern returns `null`, and highlighting wraps matches correctly.
- **Escaping:** `<` and `&` are escaped before highlighting.

## Seed data

`seed.json` holds 13 valid records covering every default category, the amounts `0.50` and `2500.00`, the dates `2024-02-29` and `2025-12-31`, and several dates in the week of 12–18 October 2026 so the chart is not empty. No description contains a repeated word, because import uses the same checks as the form.

Seed dates are fixed. On other days the 7-day chart will be empty until you add new transactions.

## Browser support

Any current Chrome, Edge, Firefox or Safari (ES modules, `fetch`, `localStorage`).

## Author

**Isimbi-Nina** · [GitHub](https://github.com/Isimbi-Nina) · h.isimbi@alustudent.com