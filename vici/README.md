# Vici, copied into this prototype

These files come unchanged from Vici, Victor Pflüger's design system
(<https://victorpflueger.github.io/ViciDesign/index.html>), from its main branch at commit **`d8bb304`**
(22 November 2026), on the way to Vici 2.0: the How it works guide (`vc-guide`) with one guide per
language (ViciDesign#13), the 2.0 byline, key figures with `vc-stat__was` (ViciDesign#11) and the rule
that a figure computed from part of the data says so in its value (added for this prototype,
ViciDesign#17), Presenting step by step with Play, Your turn, `vc-attention` and `--vc-step-fill`
(ViciDesign#15), the AI notice and the prototype brief this prototype follows. Its files still call
themselves 1.0.0 until 2.0 is released. The prototype loads them from here rather than from a CDN,
so every page is served from this site alone.

| File here | What it is |
|---|---|
| `dist/vici.min.css` | Vici's stylesheet: tokens, light and dark theme, components, icons |
| `dist/vici.js` | Vici's small script: theme toggle, tooltips, and the behaviours of its components |
| `dist/tokens.json` | Vici's token values, light and dark, for scripts and tests (the colour checks read it) |
| `assets/fonts/*.woff2` | Bricolage Grotesque, Inter, JetBrains Mono and Vici Mask, as the stylesheet expects them |
| `assets/fonts/OFL-*.txt` | The SIL Open Font License of each font family |
| `assets/marks/linkedin.png` | LinkedIn's [in] logo, as LinkedIn publishes it |
| `assets/marks/README.md` | Where the marks come from and how they may be used (it also names marks this copy leaves out) |
| `assets/brand/portrait-96.jpg` | Victor's portrait, 96 × 96 px, for the byline |
| `LICENSE` | Vici's licence |

Keep the folder structure: the stylesheet finds the fonts at `../assets/fonts/`. Never edit these
files; a fix belongs in Vici, and comes here with its next release.

**Licence.** `LICENSE` covers all of it: Vici's code and its Vici Mask font are MIT-licensed;
Bricolage Grotesque, Inter and JetBrains Mono are under the SIL Open Font License; Victor Pflüger's
name, portrait and logo are reserved for his own use; LinkedIn's logo belongs to LinkedIn.

**Updating.** Copy the same files from a newer Vici main or release (from its `dist/` and `assets/`
folders, and `LICENSE`) over these, and change the commit above and the one the tests workflow checks
out. Then run the tests and look at the prototype in light and dark: a new release may rename a
class or change a token.
