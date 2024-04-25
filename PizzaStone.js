class PizzaStone extends GameObject {
  constructor(config) {
    super(config);

    this.sprite = new Sprite({
      gameObject: this,
      src: config.src,
      animations: config.animations,
      currentAnimation: config.currentAnimation,
    });

    this.storyFlag = config.storyFlag;
    this.pizzas = config.pizzas;

    this.talking = [
      {
        required: ["USED_PIZZASTONE"],
        events: [
          {
            type: "message",
            text: "You're already used it!!!",
          },
        ],
      },
      {
        events: [
          {
            type: "message",
            text: "Approach the pizza stone ....",
          },
          {
            type: "craftingMenu",
            pizzas: this.pizzas,
          },
          {
            type: "addStoryFlags",
            flag: this.storyFlag,
          },
        ],
      },
    ];
  }

  update() {
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-stone"
      : "unused-stone";
  }
}
