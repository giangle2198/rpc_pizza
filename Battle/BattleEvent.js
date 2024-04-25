class BattleEvent {
  constructor(config) {
    this.event = config.event;
    this.battle = config.battle;
  }

  message(resolve) {
    const t = this.event.text
      .replace("{CASTER}", this.event.caster?.name)
      .replace("{ACTION}", this.event.action?.name)
      .replace("{TARGET}", this.event.target?.name);

    const text = new TextMessage({
      text: t,
      onComplete: () => {
        resolve();
      },
    });
    text.init(this.battle.element);
  }

  async stateChange(resolve) {
    const { caster, target, damage, recover, status, action } = this.event;
    let who = this.event.onCaster ? caster : target;
    if (action.targetType === "friendly") {
      who = caster;
    }

    if (damage) {
      // modify the target's hp
      target.update({
        hp: target.hp - damage,
      });

      // start blinking
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    if (recover) {
      // modify the target's hp
      let newHp = who.hp + recover;
      if (newHp > who.maxHp) {
        newHp = who.maxHp;
      }
      who.update({
        hp: newHp,
      });
    }

    if (status) {
      // modify the target's status
      who.update({
        status: { ...status },
      });
    }
    if (status == null) {
      who.update({
        status: null,
      });
    }

    // Wait a second
    await utils.wait(600);

    //Update Team components
    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    // stop blinking
    target.pizzaElement.classList.remove("battle-damage-blink");

    resolve();
  }

  replacementMenu(resolve) {
    const menu = new ReplacementMenu({
      replacements: Object.values(this.battle.combatants).filter((c) => {
        return c.team === this.event.team && c.hp > 0;
      }),
      onComplete: (replacement) => {
        resolve(replacement);
      },
    });
    menu.init(this.battle.element);
  }

  async replace(resolve) {
    const { replacement } = this.event;

    //Clear out the old combatant
    const prevCombatant =
      this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombatant.update();
    await utils.wait(400);

    //In with the new!
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);

    resolve();
  }

  submissionMenu(resolve) {
    const { caster } = this.event;

    const submissionMenu = new SubmissionMenu({
      caster: caster,
      onComplete: (submission) => {
        resolve(submission);
      },
      enemy: this.event.enemy,
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter((c) => {
        return c.id !== caster.id && c.team === caster.team && c.hp > 0;
      }),
    });
    submissionMenu.init(this.battle.element);
  }

  giveXp(resolve) {
    let amount = this.event.xp;
    const { combatant } = this.event;
    const step = () => {
      if (amount > 0) {
        amount -= 1;
        combatant.xp += 1;

        // Check if we've hit level up point
        if (combatant.xp === combatant.maxXp) {
          combatant.level += 1;
          combatant.xp = 0;
          combatant.maxXp = 200;
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      }
      resolve();
    };

    requestAnimationFrame(step);
  }

  animation(resolve) {
    const fn = BattleAnimation[this.event.animation];
    fn(this.event, resolve);
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}
