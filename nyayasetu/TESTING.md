# NyayaSetu Verification and Testing Guide

## Pre-Demo Build Verification

Run:

```bash
npx tsc --noEmit
npm run build
```

Both commands should finish successfully and create `dist/`.

## End-to-End Functional Tests

| ID | Feature | Action | Expected Result |
|---|---|---|---|
| TC-01 | 7 category tabs | Click every tab | Tab becomes indigo and updates Bare Act, portal, steps, and checklist |
| TC-02 | National links | Launch Consumer and Workplace portals | e-Jagriti and SAMADHAN open in a new tab |
| TC-03 | State switching | Set Maharashtra, open Property & RERA | MahaRERA replaces Karnataka RERA |
| TC-04 | Bare Act link | Open Rental & Housing Bare Act | India Code page opens in a new tab |
| TC-05 | Document checklist | Check three documents | Counter updates and cards become emerald |
| TC-06 | Rental routing | Enter a landlord/security-deposit complaint | App switches to Rental and returns a filing draft |
| TC-07 | Workplace routing | Enter a salary/FnF complaint | App switches to Workplace and links SAMADHAN |
| TC-08 | One-click draft | Click the complaint summary button | Chatbot creates a dated structured summary |
| TC-09 | Criminal guardrail | Enter an assault/knife/robbery complaint | App warns and advises 112 or a police FIR |
| TC-10 | Mobile layout | Resize below tablet width | Workspace stacks and tabs remain horizontally scrollable |
