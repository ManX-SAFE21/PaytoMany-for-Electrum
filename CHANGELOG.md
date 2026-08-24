# Development log

Why the code looks the way it does. The user-facing guide is in
[README.md](README.md); this file is for whoever touches the code next —
including a future me who no longer remembers today.

Repository created **2026-08-24**. Live at
https://manx-safe21.github.io/PaytoMany-for-Electrum/ (GitHub Pages, `main`
branch, root folder; a push publishes in 1–3 minutes).

---

## The bug that mattered: QR scanning never worked

Worth reading in full, because three plausible-but-wrong explanations were
investigated first and each one cost time.

**Symptom.** Pointing the camera at a Bitcoin QR code did nothing at all. No
beep, no vibration, no error banner — silence. Same result from a laptop
webcam and from a phone, and later the same silence when reading a still
image from the gallery.

**Root cause.** The `<script>` tag pointed at

```
https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js
```

which returns **404**. cdnjs does not host jsQR under that path. The script
tag failed silently, `window.jsQR` stayed `undefined`, and every decode call
threw a `ReferenceError` before reaching any of the code that would have
shown an error. Confirmed by evaluating `typeof window.jsQR` on the live
page: `"undefined"`.

The app had therefore **never** been able to read a QR code, with any camera,
on any device, since the first commit.

**Wrong leads, and why they were wrong.** Recording these so nobody
re-investigates them:

- *"The purple logo in the middle of the Pocket wallet QR is covering
  modules."* Plausible — jsQR is more fragile than native scanners on
  logo-overlaid codes. Disproved by generating a QR at ECC level H with a
  centred logo square and decoding it successfully once jsQR was actually
  loaded.
- *"A laptop webcam can't read a QR shown on a phone screen."* Also
  plausible — fixed-focus optics, moiré, glare. Real effects, but not the
  cause here: the phone's own rear camera failed identically.
- *"The address itself is being rejected by the validator."* Disproved early
  by running the app's own `parsePayload()` in Node against the address in
  every form it could arrive in — bare, uppercase, `bitcoin:` prefixed, with
  `?amount=`, with trailing whitespace. All accepted.

**Fix.** jsQR 1.4.0 is now **vendored** as [`jsQR.js`](jsQR.js) in the repo
rather than loaded from a CDN.

**Verification.** A QR encoding `bitcoin:<address>` was generated in-browser
at ECC H, once plain and once with a centred logo square imitating the
Pocket wallet mark, then decoded through the app's own code path. Both
decoded correctly and the address landed in the recipient list.

---

## Decisions worth not casually reverting

**jsQR is vendored on purpose — do not "optimise" it back to a CDN.** Two
reasons, and the second is the important one. It makes the app work offline;
and it removes a third party's ability to alter the code that reads Bitcoin
addresses. A compromised CDN could silently swap an address during export,
and this app's entire output is addresses. The file was downloaded from
jsDelivr and byte-compared against unpkg — identical, sha256
`bc40c8a15196236b2314db0856f72ca0b49980cd5413b8c852a7349f5fee0859`, recorded
in a comment next to the script tag.

**The amount input's selector is `input[type=text].amt`, not `.amt`.** It has
to be. `.amt` has specificity (0,1,0) and loses to the later generic
`input[type=text] { width: 100% }` at (0,1,1). When it lost, the amount box
took the whole row on step 2, collapsed the address block to near-zero width,
and the address wrapped one character per line. Simplifying that selector
reintroduces the bug.

**Caps and the default amount live in [`config.js`](config.js).** They were
moved out of the inline script so they can be edited through GitHub's web
editor — open the file, click the pencil, change a number, commit — without
opening `index.html`. `index.html` keeps fallback values for the case where
`config.js` fails to load; **if you change one, change the other**, or the
fallback silently disagrees with the config.

**The app never touches keys, seed, PSBT, or the wallet.** It turns QR codes
into a text list. Coin selection, fees, signing and broadcasting stay in
Electrum. This is the security model, not an unfinished feature: it means a
compromised copy of this app cannot move funds. It can only lie about an
address — which is why the README tells the user to check addresses on
Electrum's signing screen.

---

## Change history

Grouped by intent rather than by commit; `git log` has the per-commit detail.

**Initial publication.** Single-file app imported as `index.html`; Italian
README added.

**QR reading.** Three robustness changes (still-image decoding,
`inversionAttempts: 'attemptBoth'`, camera frames downscaled to 720px on the
long side) were made while the logo hypothesis was still believed. Then the
real cause was found and jsQR was vendored. The still-image button was
**removed afterwards at the owner's request** — the live camera path works,
and it was the only remaining scan path they wanted. `attemptBoth` and the
720px downscale were kept: they cost nothing and help with reflections and
slower phones.

**Layout and styling.** Fixed the step-2 row collapse described above.
Adopted safe21.io's design tokens so the app reads as part of the site:
`--ink #0A0F1C`, `--panel #111B2E`, `--line #1F2B44`, `--light #F5F7FA`,
`--muted #95A1B5`, teal `#2DD4BF` as the primary accent, Bitcoin orange
`#F7931A` reserved for warnings. Type stack matched too — Inter for body,
Space Grotesk for headings, Space Mono for addresses and figures. The SAFE21
keyhole wordmark sits in the header at 44px, linking back to safe21.io, with
"Paga a molti" and "(Pay to many)" stacked beside it — stacked rather than
inline because at 44px the wordmark plus the counter badge leaves too little
width on a 375px screen, and the text truncated.

**Privacy.** The README's example output originally used the owner's real
receive address, taken from a screenshot shared while debugging. Replaced
with the two standard BIP173 spec addresses, which hold no funds and appear
throughout Bitcoin documentation for exactly this purpose. Both verified
against the app's own validator.

**Configuration.** Caps and default amount extracted to `config.js`. Current
values, with euro equivalents at roughly €67,500/BTC:

| Constant | Value | ≈ EUR | Effect |
|---|---|---|---|
| `DUST_SATS` | 330 | 0.22 | Below this an output is dust; row flagged, export blocked |
| `CAP_QR_SATS` | 20,000 | 13.50 | A QR carrying a larger amount is rejected outright |
| `CAP_ROW_SATS` | 500,000 | 337 | Manually entered rows are clamped to this |
| `CAP_TOTAL_SATS` | 500,000 | 337 | Above this total, an explicit confirmation is required |
| `DEFAULT_EUR` | 5 | — | Pre-filled amount on step 2 (~7,400 sat per recipient) |

At €5 per recipient this allows roughly 67 recipients before the
confirmation prompt.

---

## Open items

- **No LICENSE file.** On a public repository the default is "all rights
  reserved": the code is readable but nobody may legally reuse or fork it.
  Deliberate for now — worth revisiting if the intent is open source, given
  the site footer describes SAFE21's code that way.
- **Google Fonts still load from a CDN.** Cosmetic only — a failure degrades
  typography, it cannot alter an address — but vendoring them would make the
  app fully self-contained and genuinely offline-capable.
- **Testnet addresses are accepted silently.** The validator allows version
  bytes `0x6f`/`0xc4` and HRPs `tb`/`bcrt`. A testnet address enters the list
  with no warning; Electrum on mainnet will reject the resulting list. A
  visible tag, or outright rejection, would fail earlier and more clearly.
- **Editing a row's amount clears its `fromQr` flag**, so a subsequent "apply
  to all" overwrites an amount that came from the QR. Probably intended —
  touching a row is a deliberate act — but never explicitly confirmed.
