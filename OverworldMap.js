class OverworldMap {
  constructor(config) {
    this.gameObjects = {};
    this.walls = config.walls || {};
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.configObjects = config.configObjects;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.overworld = null;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    return Object.values(this.gameObjects).find((obj) => {
      if (obj.x === x && obj.y === y) {
        return true;
      }
      if (
        obj.intentPosition &&
        obj.intentPosition[0] === x &&
        obj.intentPosition[1] === y
      ) {
        return true;
      }

      return false;
    });
  }

  async startCutscenes(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutscenePlaying = false;

    // Reset map so gameObjects can do their thing again
    Object.values(this.gameObjects).forEach((obj) => {
      obj.doBehaviorEvent(this);
    });
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((obj) => {
      return `${obj.x},${obj.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });

      relevantScenario && this.startCutscenes(relevantScenario.events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscenes(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach((key) => {
      const object = this.configObjects[key];
      object.id = key;

      switch (object.type) {
        case "Person": {
          this.gameObjects[key] = new Person(object);
          break;
        }
        case "PizzaStone": {
          this.gameObjects[key] = new PizzaStone(object);
          break;
        }
      }

      this.gameObjects[key].id = key;

      this.gameObjects[key].mount(this);
    });
  }
}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      },
      npc1: {
        type: "Person",
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 400 },
          { type: "stand", direction: "up", time: 400 },
          { type: "stand", direction: "right", time: 400 },
          { type: "stand", direction: "down", time: 400 },
        ],
        talking: [
          {
            required: ["TALKED_WITH_ERIO"],
            events: [
              {
                type: "message",
                text: "Isn't Erio coolest?",
                faceHero: "npc1",
              },
            ],
          },
          {
            events: [
              {
                type: "message",
                text: "I'm going to crush you",
                faceHero: "npc1",
              },
              // {
              //   type: "message",
              //   text: "Go away!!!",
              // },
              // {
              //   who: "hero",
              //   type: "walk",
              //   direction: "up",
              // },
              {
                type: "battle",
                enemyId: "beth",
              },
              {
                type: "addStoryFlags",
                flag: "DEFEATED_BETH",
              },
              {
                type: "message",
                text: "You crushed me like weak pepper",
                faceHero: "npc1",
              },
            ],
          },
        ],
      },
      npc2: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        // behaviorLoop: [
        //   { type: "walk", direction: "left" },
        //   { type: "stand", direction: "up", time: 800 },
        //   { type: "walk", direction: "up" },
        //   { type: "walk", direction: "right" },
        //   { type: "walk", direction: "down" },
        // ],
        talking: [
          {
            events: [
              {
                type: "message",
                text: "HAHAH!!!",
                faceHero: "npc2",
              },
              { type: "addStoryFlags", flag: "TALKED_WITH_ERIO" },
            ],
          },
        ],
      },
      npc3: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc3.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          // { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
        ],
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/characters/pizza-stone.png",
        storyFlag: "USED_PIZZASTONE",
        animations: {
          "used-stone": [[0, 0]],
          "unused-stone": [[1, 0]],
        },
        currentAnimation: "unused-stone",
        pizzas: ["f001", "v001"],
      },
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            {
              who: "npc2",
              type: "walk",
              direction: "left",
            },
            {
              who: "npc2",
              type: "stand",
              direction: "up",
              time: 200,
            },
            {
              type: "message",
              text: "You're not supposed to be here!!!",
            },
            {
              who: "npc2",
              type: "walk",
              direction: "right",
            },
            {
              who: "npc2",
              type: "stand",
              direction: "down",
              time: 200,
            },
            {
              who: "hero",
              type: "walk",
              direction: "down",
            },
            {
              who: "hero",
              type: "walk",
              direction: "left",
            },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(4),
              y: utils.withGrid(4),
              direction: "down",
            },
          ],
        },
      ],
    },
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(4),
        y: utils.withGrid(5),
      },
      npc2: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(6),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              {
                type: "message",
                text: "You just take it!!!",
                faceHero: "npc2",
              },
              {
                who: "hero",
                type: "walk",
                direction: "left",
              },
            ],
          },
        ],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(4, 4)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up",
            },
          ],
        },
      ],
    },
  },
};
