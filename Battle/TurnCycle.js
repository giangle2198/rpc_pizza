class TurnCycle {
  constructor({ battle, onNewEvent, onWinner }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player";
    this.onWinner = onWinner;
  }

  async turn() {
    // get caster
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId =
      this.battle.activeCombatants[
        this.currentTeam === "player" ? "enemy" : "player"
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });

    //Stop here if we are replacing this Pizza
    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement,
      });
      await this.onNewEvent({
        type: "message",
        text: `Go get 'em, ${submission.replacement.name}!`,
      });
      this.nextTurn();
      return;
    }

    if (submission.instanceId) {
      // Add to list to perist to player state later
      this.battle.usedInstanceIds[submission.instanceId] = true;


      // Removing item from battle store
      this.battle.items = this.battle.items.filter(
        (i) => i.instanceId !== submission.instanceId
      );
    }

    const resultingEvents = caster.getReplacedEvents(submission.action.success);
    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    //Did the target die?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: "message",
        text: `${submission.target.name} is ruined!`,
      });

      if (submission.target.team === "enemy") {
        const playerActivePizzaId = this.battle.activeCombatants.player;
        const xp = submission.target.givesXp;


        await this.onNewEvent({
          type: "message",
          text: `Gained ${xp} XP!`,
        })
        
        await this.onNewEvent({
          type: "giveXp",
          xp: xp,
          combatant: this.battle.combatants[playerActivePizzaId]
        })
      }
    }

    //Do we have a winning team?
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: "message",
        text: "Winner!",
      });
      
      this.onWinner(winner);

      return;
    }

    //We have a dead target, but still no winner, so bring in a replacement
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
        team: submission.target.team,
      });
      await this.onNewEvent({
        type: "replace",
        replacement: replacement,
      });
      await this.onNewEvent({
        type: "message",
        text: `${replacement.name} appears!`,
      });
    }

    // Check for the post events
    // {Do somethings AFTER submission}
    const postEvent = caster.getPostEvents();
    for (let i = 0; i < postEvent.length; i++) {
      const event = {
        ...postEvent[i],
        submission,
        caster,
        action: submission.action,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    // Check for status expires
    const expireEvent = caster.decrementStatus();
    if (expireEvent) {
      await this.onNewEvent(expireEvent);
    }

    this.nextTurn();
  }

  nextTurn() {
    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  getWinningTeam() {
    let aliveTeams = {};
    Object.values(this.battle.combatants).forEach(c => {
      if (c.hp > 0) {
        aliveTeams[c.team] = true;
      }
    })
    if (!aliveTeams["player"]) { return "enemy"}
    if (!aliveTeams["enemy"]) { return "player"}
    return null;
  }


  async init() {
    await this.onNewEvent({
      type: "message",
      text: `${this.battle.enemy.name} wants to throw down!`,
    });

    // Start the first turn
    this.turn();
  }
}
