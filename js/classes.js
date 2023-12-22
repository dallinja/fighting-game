class Sprite {
  constructor({
    x,
    y,
    width,
    height,
    imageSrc,
    offset = { x: 0, y: 0 },
    scale = 1,
    frames = 1,
    framesHold = 7,
  }) {
    this.x = x;
    this.y = y;
    this.width = width * scale;
    this.height = height * scale;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.offset = offset;
    this.frames = frames;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = framesHold;
  }

  draw() {
    // draw rect
    // ctx.fillStyle = "#44dd44aa";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.frames),
      0,
      this.image.width / this.frames,
      this.image.height,
      this.x - this.offset.x,
      this.y - this.offset.y,
      (this.image.width * this.scale) / this.frames,
      this.image.height * this.scale
    );
  }

  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent >= this.frames - 1) {
        this.framesCurrent = 0;
      } else {
        this.framesCurrent++;
      }
    }
  }

  update() {
    this.draw();
    this.animateFrames();
  }
}

class Player extends Sprite {
  constructor({
    x,
    y,
    width,
    height,
    color,
    facing = "right",
    attackBox = { offset: {}, width: undefined, height: undefined },
    sprites = { idle: {} },
    spriteScale = 1,
    spriteOffset = { x: 0, y: 0 },
    keys = { left: "a", right: "d", jump: "w", attack: " " },
  }) {
    super({
      x,
      y,
      width,
      height,
      imageSrc: sprites.idle.imageSrc,
      scale: spriteScale,
      offset: spriteOffset,
      frames: sprites.idle.frames,
      framesHold: sprites.idle.framesHold,
    });
    this.width = width;
    this.height = height;
    this.color = color;
    this.facing = facing;
    this.velocity = { x: 0, y: 20 };
    this.dead = false;
    this.isAttacking = false;
    this.attackBox = {
      x: this.x,
      y: this.y,
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.health = 100;
    this.sprites = sprites;
    this.keys = keys;
    this.activeKeys = {
      left: false,
      right: false,
      jump: false,
      attack: false,
    };

    for (const sprite in this.sprites) {
      this.sprites[sprite].image = new Image();
      this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
    }

    this.mount();
  }

  handleKeydown(e) {
    if (this.dead) return;

    if (e.key === this.keys.left) {
      this.activeKeys.left = true;
      this.lastKey = this.keys.left;
    } else if (e.key === this.keys.right) {
      this.activeKeys.right = true;
      this.lastKey = this.keys.right;
    } else if (e.key === this.keys.jump) {
      if (this.velocity.y === 0) {
        this.velocity.y = -20;
      }
    } else if (e.key === this.keys.attack) {
      this.attack();
    }
  }

  handleKeyup(e) {
    if (this.dead) return;

    if (e.key === this.keys.left) {
      this.activeKeys.left = false;
    } else if (e.key === this.keys.right) {
      this.activeKeys.right = false;
    }
  }

  mount() {
    console.log("mounting");
    window.addEventListener("keydown", this.handleKeydown.bind(this));
    window.addEventListener("keyup", this.handleKeyup.bind(this));
  }

  unmount() {
    console.log("unmounting");
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("keyup", this.handleKeyup);
  }

  move() {
    this.velocity.x = 0;

    if (this.activeKeys.left && this.lastKey === this.keys.left && this.x > 0) {
      this.velocity.x = -5;
      this.switchSprite("run");
    } else if (
      this.activeKeys.right &&
      this.lastKey === this.keys.right &&
      this.x < 1024 - this.width
    ) {
      this.velocity.x = 5;
      this.switchSprite("run");
    } else {
      this.switchSprite("idle");
    }

    if (this.velocity.y < 0) {
      this.switchSprite("jump");
    } else if (this.velocity.y > 0) {
      this.switchSprite("fall");
    }
  }

  update() {
    this.draw();
    if (!this.dead) {
      this.animateFrames();
    }

    // attack boxes
    this.attackBox.x = this.x + this.attackBox.offset.x;
    this.attackBox.y = this.y + this.attackBox.offset.y;

    // draw atackbox
    // ctx.fillStyle = "green";
    // ctx.fillRect(
    //   this.x + this.attackBox.offset.x,
    //   this.y + this.attackBox.offset.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // );

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    const ground = canvas.height - 96;
    if (this.y + this.height + this.velocity.y >= ground) {
      this.velocity.y = 0;
      this.y = ground - this.height;
    } else this.velocity.y += GRAVITY;

    this.move();
  }

  attack() {
    this.switchSprite("attack1");
    this.isAttacking = true;
  }

  takeHit() {
    this.health -= 15;

    if (this.health <= 0) {
      this.switchSprite("death");
    } else this.switchSprite("takeHit");
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.frames - 1) {
        this.dead = true;
      }
      return;
    }
    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.frames - 1
    )
      return;
    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.frames - 1
    )
      return;

    if (this.image === this.sprites[sprite].image) return;

    this.image = this.sprites[sprite].image;
    this.frames = this.sprites[sprite].frames;
    this.framesHold = this.sprites[sprite].framesHold;
    this.framesCurrent = 0;
  }
}
