const https = require('https');
const inquirer = require('inquirer');

const prompts = inquirer.createPromptModule ? inquirer.createPromptModule() : inquirer.prompt.bind(inquirer);
const { Pokemon, Battle } = require('./battle');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
      });
    }).on('error', (err) => reject(err));
  });
}

async function getMovesFromApi(movesArray, maxMoves = 5) {
  const moves = [];
  // We'll try moves in order, but only collect up to `maxMoves`. Limit attempts to avoid too many calls.
  const maxAttempts = Math.min(movesArray.length, 15);
  for (let i = 0; i < maxAttempts && moves.length < maxMoves; i++) {
    const moveRef = movesArray[i].move;
    try {
      const md = await fetchJSON(moveRef.url);
      const power = md.power || 40; // fallback power
      const accuracy = (md.accuracy != null) ? (md.accuracy / 100) : 0.95; // convert to fraction
      moves.push({ name: moveRef.name.replace('-', ' '), power, accuracy });
    } catch (err) {
      // skip this move on error and continue
      continue;
    }
  }
  if (moves.length === 0) moves.push({ name: 'Struggle', power: 40, accuracy: 0.9 });
  return moves;
}

async function fetchPokemonFromAPI(name) {
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`;
  const body = await fetchJSON(url);

  const stat = (key) => (body.stats.find((s) => s.stat.name === key) || {}).base_stat || 10;
  const attack = Math.max(8, Math.round(stat('attack') / 2));
  const defense = Math.max(8, Math.round(stat('defense') / 2));

  const moves = await getMovesFromApi(body.moves || [], 5);

  return new Pokemon(body.name.charAt(0).toUpperCase() + body.name.slice(1), 300, attack, defense, moves);
}

async function interactiveMode() {
  console.log('Fetch Pokémon from PokeAPI and battle (HP = 300).');
  // Show a short starter list and allow custom name entry
  // Try to populate the starter list from the PokeAPI; fall back to hardcoded list on error.
  let starterList = [];
  try {
    const res = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=12');
    starterList = (res.results || []).map(r => ({
      name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: r.name
    }));
    if (starterList.length === 0) throw new Error('No results');
  } catch (err) {
    console.log('Could not fetch starter list from API, using defaults.');
    starterList = [
      { name: 'Pikachu', value: 'pikachu' },
      { name: 'Charmander', value: 'charmander' },
      { name: 'Bulbasaur', value: 'bulbasaur' },
      { name: 'Squirtle', value: 'squirtle' },
      { name: 'Eevee', value: 'eevee' }
    ];
  }
  starterList.push({ name: 'Enter a different name...', value: '__custom' });

  const { chosen } = await prompts([{ type: 'list', name: 'chosen', message: 'Pick a Pokémon from the list (or enter a custom name):', choices: starterList }]);
  let name;
  if (chosen === '__custom') {
    const resp = await prompts([{ type: 'input', name: 'custom', message: 'Enter Pokémon name (e.g. pikachu):' }]);
    name = (resp && resp.custom) ? resp.custom.trim() : '';
  } else {
    name = chosen;
  }

  if (!name || !name.trim()) { console.log('No name provided. Exiting.'); return; }

  try {
    const player = await fetchPokemonFromAPI(name);
    const wild = await fetchPokemonFromAPI('rattata');

    const battle = new Battle(player, wild, console.log);
    console.log(`You chose ${player.name}! (HP ${player.hp}) Battle start vs ${wild.name}.\n`);

    while (!player.isFainted() && !wild.isFainted()) {
      console.log('\nYour HP:', player.hp, '/', player.maxHp);
      console.log('Enemy HP:', wild.hp, '/', wild.maxHp);

      // Ask the player to pick a move using inquirer list prompt
      const moveChoices = player.moves.map((m, i) => ({
        name: `${m.name} (power ${m.power}, acc ${Math.round(m.accuracy*100)}%)`,
        value: i
      }));
  const { moveIdx } = await prompts([{ type: 'list', name: 'moveIdx', message: 'Choose move:', choices: moveChoices }]);
  const idx = moveIdx;
      await battle.turn(player, idx, wild);
      if (wild.isFainted()) break;

      const eidx = Math.floor(Math.random() * wild.moves.length);
      await battle.turn(wild, eidx, player);
    }

    const winner = player.isFainted() ? wild : player;
    console.log(`\nBattle finished. Winner: ${winner.name}`);
  } catch (err) {
    console.log('Failed to fetch Pokémon from PokeAPI:', err.message || err);
  }
}

(async function main() {
  await interactiveMode();
})();
