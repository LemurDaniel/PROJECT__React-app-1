
import ParticleManager, { Particle } from './Particle';
import Vector from './Vector'
import Matter from 'matter-js';



class Bullet extends Particle {


  static rectangle = [10, -2.5, 20, 5];
  static vertices = Matter.Bodies.rectangle(...Bullet.rectangle).vertices.map(v => new Vector(v.x, v.y));

  constructor(pos, velocity) {
    super(pos, velocity,
      {

        label: 'bullet',
        frictionAir: 0,
        friction: 0,
        isSensor: true,

        vertices: Bullet.vertices.map(v => v.MatterVector),
      }
    );

  }

  move(canvas) {
    if(!this.isOOB(canvas)) return;

    this.alive = false;
    this.died = true;
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.fillRect(...Bullet.rectangle);
  }

  onCollision(ast) {

    ast.disableCollision();
    ast.alive = false;

    this.alive = false;
    this.hidden = true;
    this.fadeTime = 0;

    return Math.floor(ast.mass / (Math.random() * 10 + 100));

  }

}


class Ship extends Particle {

  constructor(x, y) {
    super(
      new Vector(x, y),
      new Vector(0, 0),
      {
        radius: 15,
        lives: 3,

        label: 'spaceship',
        frictionAir: 0.009,
        friction: 0,
        density: 1,

        restitution: 0,
        isSensor: true,
      }
    )

    this.faded = true;
    this.cursor = new Vector(1, 1);
    this.maxV = 14;

    this.cannon = new ParticleManager();
  }

  shoot() {
    this.cannon.push(new Bullet(
      this.copy(), Vector.fromAngle(this.angle, 20)
    ))
  }

  setCursor(pos) {
    this.cursor = Vector.sub(pos, this);
  }


  thrust(gradual) {
    if (gradual) {
      this.velocity.add(Vector.fromAngle(
        this.angle, this.cursor.mag() * 0.00105))
    } else {
      this.velocity = Vector.fromAngle(
        this.angle, this.cursor.mag() * 0.035)
    }

    Matter.Body.setVelocity(this.matterBody, this.MatterVelocity);
  }

  drawLives(ctx) {

    const canvas = ctx.canvas;
    ctx.setTransform(1, 0, 0, 1, canvas.width * 0.05, canvas.height * 0.035)

    const size = 0.8;
    ctx.scale(size, size)
    ctx.rotate(-Math.PI / 4)

    for (let i = 0; i < this.lives; i++) {
      this.draw(ctx);
      ctx.translate(-10, 0);
      ctx.translate(60 * size, 60 * size);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  draw(ctx) {

    // Draw collsion body for testing. 
    //ctx.beginPath();
    //ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
    //ctx.stroke();

    ctx.translate(10, 0);

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-20, 20)
    ctx.lineTo(-20, -20)
    ctx.closePath();
    ctx.stroke();

    ctx.strokeRect(-28, -5 - 10, 8, 10);
    ctx.strokeRect(-28, 5, 8, 10);
    ctx.strokeRect(16, -1, 10, 2);

  }

  move(canvas) {

    this.velocity.limit(this.maxV);

    if (this.velocity.mag() <= 10e-2) this.velocity.setMag(0);

    this.angle = this.cursor.heading();

    if (!this.faded) this.fade();

  }

  onCollision(ast) {

    ast.disableCollision();
    ast.alive = false;

    if (--this.lives <= 0)
      this.alive = false;
    else {
      this.faded = false;
      this.hidden = true;
      this.fadeTime = 12;
      this.fadeEnd = 12;
    }
  }
}



export default Ship;