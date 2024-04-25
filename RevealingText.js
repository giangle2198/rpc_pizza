class RevealingText {
  constructor(config) {
    this.element = config.element;
    this.text = config.text;
    this.speed = config.speed || 60;

    this.timeout = null;
    this.isDone = false;
  }

  revealOneCharacter(list) {
    const next = list.splice(0, 1)[0];
    next.element.classList.add("visible");
    
    if (list.length > 0) {
      this.timeout = setTimeout(() => {
        this.revealOneCharacter(list);
      }, next.delayAfter);
    } else {
      this.isDone = true;
    }
  }

  wrapToDone() {
    clearTimeout(this.timeout);
    this.isDone = true;
    this.element.querySelectorAll("span").forEach((span) => {
        span.classList.add("visible");
    })
  }

  init() {
    let characters = [];
    this.text.split("").forEach((c) => {
      // Create span
      let span = document.createElement("span");
      span.textContent = c;
      this.element.appendChild(span);

      // Push to array
      characters.push({
        element: span,
        delayAfter: c === " " ? 0 : this.speed,
      });
    });

    this.revealOneCharacter(characters);
  }
}
