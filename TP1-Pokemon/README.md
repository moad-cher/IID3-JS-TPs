# TP1 Pokémon — CLI demo

Small Node.js command-line Pokémon-style battle demo.

How to run

- Demo (non-interactive simulation):

  node ./index.js --demo

- Interactive mode:

  node ./index.js

What it is

- `battle.js` — contains `Pokemon` and `Battle` classes and a `runDemo()` helper.
- `index.js` — entry; offers interactive play or a demo simulation for fast verification.

Notes

- No external dependencies; uses Node's built-in `readline`.
- The simulation is intentionally simple and meant for a TP exercise.
