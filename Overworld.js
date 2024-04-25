class OverWorld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  gameLoopStepWork(delta) {
    // Clean off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Establish camera focus
    const cameraPerson = this.map.gameObjects.hero;

    // Update Game Objects
    Object.values(this.map.gameObjects).forEach((obj) => {
      obj.update({
        delta,
        arrow: this.directionInput.direction,
        map: this.map,
      });
    });

    // Draw Lower map
    this.map.drawLowerImage(this.ctx, cameraPerson);

    // Draw Game Objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((obj) => {
        obj.sprite.draw(this.ctx, cameraPerson);
      });

    // Draw Upper map
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  startGameLoop() {

    let previousMs;
    const step = 1/60;

    const stepFn = (timestampMs) => {
      if (this.map.isPaused) {
        return;
      }

      if (!previousMs) {
        previousMs = timestampMs;
      }
      let delta = (timestampMs - previousMs) / 1000;
      while(delta >= step) {
        this.gameLoopStepWork(step);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000;

      // Business usual stick
      requestAnimationFrame(stepFn);
    };
    // Kick off the first step
    requestAnimationFrame(stepFn);
  }

  buildActionInput() {
    new KeyPressListener("Enter", () => {
      this.map.checkForActionCutscene();
    });
    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscenes([{ type: "pause" }]);
      }
    });
  }

  buildPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        this.map.checkForFootstepCutscene();
      }
    });
  }

  startMap(mapConfig, heroInitialPosition = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (heroInitialPosition) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialPosition.x;
      hero.y = heroInitialPosition.y;
      hero.direction = heroInitialPosition.direction;
    }

    this.progress.mapId = mapConfig.id;
    this.progress.stateHeroPositionX = this.map.gameObjects.hero.x;
    this.progress.stateHeroPositionY = this.map.gameObjects.hero.y;
    this.progress.stateHeroDirection = this.map.gameObjects.hero.direction;
  }

  async init() {
    const container = document.querySelector(".game-container");

    //Create a new Progress tracker
    this.progress = new Progress();

    //Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    // const useSaveFile = await this.titleScreen.init(container);
    const useSaveFile = false;

    //Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.stateHeroPositionX,
        y: this.progress.stateHeroPositionY,
        direction: this.progress.stateHeroDirection,
      };
    }

    this.hud = new Hud();
    this.hud.init(container);

    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    this.buildActionInput();
    this.buildPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();

    // this.map.startCutscenes([{ type: "battle", enemyId: "erio" }]);
  }
}
