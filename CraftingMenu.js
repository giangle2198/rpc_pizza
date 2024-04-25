class CraftingMenu {
  constructor(config) {
    this.pizzas = config.pizzas;
    this.onComplete = config.onComplete;
  }

  getOptions() {
    return this.pizzas.map((key) => {
      return {
        label: Pizzas[key].name,
        description: Pizzas[key].description,
        handler: () => {
          window.playerState.addPizza(key);
          this.close();
        },
      }
    })
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("CraftingMenu");
    this.element.classList.add("overlayMenu");

    this.element.innerHTML = `
        <h2>Crafting Menu</h2>
        `;
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container,
    });
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions());

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    });
  }
}
