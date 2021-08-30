
import ParticleManager, { Particle } from './Particle';
import Vector from './Vector'
import Matter from 'matter-js';



class Bullet extends Particle {

  constructor(pos, velocity) {
    super(pos, velocity, 10);

    this.add(Vector.mul(velocity, 1))
    this.angle = this.velocity.heading();
    this.rect = [10, -2.5, 20, 5];

    this.matterBody = Matter.Bodies.rectangle(
      ...this.rect,
      {
        label: 'bullet',
        frictionAir: 0,
        friction: 0,
        isSensor: true,
        plugin: {
          particleRef: this,
        }
      })

    Matter.Body.setPosition(this.matterBody, this.MatterVector);
    Matter.Body.setVelocity(this.matterBody, this.MatterVelocity);
  }

  onActive(particleManager) {
    this.pm = particleManager;
    Matter.Composite.add(this.pm.matterWorld, this.matterBody);
  }

  onDeath() {
    Matter.Composite.remove(this.pm.matterWorld, this.matterBody);
  }

  move(canvas) {
    // super.move(canvas);
    // this.add(this.velocity);
    this.x = this.matterBody.position.x;
    this.y = this.matterBody.position.y;

    this.alive = !this.isOOB(canvas);
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.fillRect(...this.rect);
  }

  onCollision(ast) {

    ast.alive = false
    this.alive = false;
    this.hidden = true;
    this.fadeTime = 0;

    return Math.floor(ast.mass / (Math.random() * 10 + 100));

  }

}


class Ship extends Particle {

  constructor(x, y, matterWorld) {
    super(
      new Vector(x, y),
      new Vector(0, 0), 15, 3
    )

    this.faded = true;
    this.cursor = new Vector(1, 1);
    this.friction = 0.05;
    this.maxV = 14;

    this.cannon = new ParticleManager(matterWorld);

    this.matterBody = Matter.Bodies.circle(
      this.x, this.y, this.radius,
      {
        label: 'spaceship',
        frictionAir: 0,
        friction: 0,
        density: 1,
        isSensor: true,
        plugin: {
          particleRef: this,
        }
      })

    Matter.Composite.add(matterWorld, this.matterBody);
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
  }

  // draw spaceship
  draw(ctx) {
    this.drawLives(ctx)

    if (!this.faded) {
      this.fade();
      if (this.hidden) return;
    }

    super.draw(ctx);

    // Draw collsion body for testing. 
    //ctx.beginPath();
    //ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
    //ctx.stroke();

    ctx.translate(10, 0);
    this.drawShip(ctx);
  }

  drawLives(ctx) {

    const canvas = ctx.canvas;
    ctx.setTransform(1, 0, 0, 1, canvas.width * 0.05, canvas.height * 0.035)

    const size = 0.8;
    ctx.scale(size, size)
    ctx.rotate(-Math.PI / 4)

    for (let i = 0; i < this.lives; i++) {
      this.drawShip(ctx);
      ctx.translate(60 * size, 60 * size);
    }
  }

  drawShip(ctx) {

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

    // limit Velocity to max Velocity
    this.velocity.limit(this.maxV);

    // reduce velocity by friction // add/subtract for negative/positive velocity
    this.velocity.x -= this.friction * Math.sign(this.velocity.x);
    this.velocity.y -= this.friction * Math.sign(this.velocity.y);

    if (this.velocity.mag() <= 10e-2) this.velocity.setMag(0);

    this.angle = this.cursor.heading();

    super.move(canvas);

    // The movement is still being calculated by the particle object and injected as positions into the MatterJS Object.
    // MatterJs doesn't need to move the ship, it only has to calculate whether a collsion with an asteroid occured.
    this.matterBody.position.x = this.x;
    this.matterBody.position.y = this.y;
    this.matterBody.velocity.x = 0;
    this.matterBody.velocity.y = 0;
    // The angle has no importance, since the collision object for matterJs is a circle and not the actual shape of the spaceship.
    //this.matterBody.angle = 0;
  }

  onCollision(ast) {
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