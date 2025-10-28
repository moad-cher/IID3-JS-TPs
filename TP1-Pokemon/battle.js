class Pokemon {
  constructor(name, hp, attack, defense, moves = []) {
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.attack = attack;
    this.defense = defense;
    this.moves = moves;
  }

  isFainted() {
    return this.hp <= 0;
  }

  takeDamage(amount) {
    const dmg = Math.max(0, Math.round(amount));
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}

class Battle {
  constructor(player, enemy, logger = console.log) {
    this.player = player;
    this.enemy = enemy;
    this.log = logger;
  }

  computeDamage(attacker, move, defender) {
    // Very small formula: base = move.power + attack - defense/2
    const base = (move.power || 5) + attacker.attack - defender.defense * 0.5;
    const variability = 0.85 + Math.random() * 0.3; // 0.85 - 1.15
    return Math.max(1, Math.round(base * variability));
  }

  performMove(attacker, move, defender) {
    // accuracy check
    if (move.accuracy && Math.random() > move.accuracy) {
      this.log(`${attacker.name}'s ${move.name} missed!`);
      return { hit: false, damage: 0 };
    }

    const damage = this.computeDamage(attacker, move, defender);
    const taken = defender.takeDamage(damage);
    this.log(`${attacker.name} used ${move.name}! It dealt ${taken} damage to ${defender.name}.`);
    if (defender.isFainted()) this.log(`${defender.name} fainted!`);
    return { hit: true, damage: taken };
  }

  async turn(attacker, moveIndex, defender) {
    const move = attacker.moves[moveIndex];
    if (!move) {
      this.log(`${attacker.name} tried to use an unknown move and stumbled...`);
      return;
    }
    return this.performMove(attacker, move, defender);
  }

  // Simple loop for demo: players take turns until one faints
  async runDemo() {
    this.log(`Battle start: ${this.player.name} vs ${this.enemy.name}`);
    let attacker = this.player;
    let defender = this.enemy;
    while (!this.player.isFainted() && !this.enemy.isFainted()) {
      // choose random move
      const idx = Math.floor(Math.random() * attacker.moves.length);
      await this.turn(attacker, idx, defender);
      // swap
      [attacker, defender] = [defender, attacker];
      // small delay for readability when running interactively
      await new Promise((r) => setTimeout(r, 200));
    }

    const winner = this.player.isFainted() ? this.enemy : this.player;
    this.log(`Battle over. Winner: ${winner.name}`);
    return winner;
  }
}

module.exports = { Pokemon, Battle };
