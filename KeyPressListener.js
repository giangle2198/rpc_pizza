class KeyPressListener {
  constructor( code, callback ) {
    let keySafe = true;
    this.keyDownHandler = (e) => {
      if (e.code === code) {
        if (keySafe) {
          keySafe = false;
          callback();
        }
      }
    };
    this.keyUpHandler = (e) => {
      if (e.code === code) {
        keySafe = true;
      }
    };

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
  }

  unbind() {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
  }
}
