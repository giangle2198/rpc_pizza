class TextMessage {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createMessage() {
    this.element = document.createElement("div");
    this.element.classList.add("text-message");

    this.element.innerHTML = `
            <div class="text-message__text"></div>
            <button class="text-message__button">Next</button>
        `;

    this.revealingText = new RevealingText({
      element: this.element.querySelector(".text-message__text"),
      text: this.text,
    });

    this.element
      .querySelector(".text-message__button")
      .addEventListener("click", (e) => {
        // Close the message
        this.done();
      });

    this.eventListener = new KeyPressListener("Enter", () => {
      // Close the message
      this.done();
    });
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove();
      this.eventListener.unbind();
      this.onComplete();
    } else {
      this.revealingText.wrapToDone();
    }
  }

  init(container) {
    this.createMessage();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
