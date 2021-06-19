
import ParticleManager, { Particle } from './particle';
import Vector from './Vector'




class Bullet extends Particle {

  constructor(pos, velocity) {
    super(pos, velocity, 10);
    this.add(Vector.mul(velocity, 1))
  }

  move(canvas) {
    // super.move(canvas);
    this.add(this.velocity)
    this.alive = !this.isOOB(canvas);
  }

  draw(ctx) {

    ctx.translate(this.x, this.y);
    ctx.rotate(this.velocity.heading())
    ctx.fillRect(10, -2.5, 20, 5);

    ctx.setTransform(1, 0, 0, 1, 0, 0)

  }

  onCollision(ast) {

    ast.alive = false
    this.alive = false;

    return 20;
  }

}


class Ship extends Particle {

  constructor(x, y, angle) {
    super(
      new Vector(x, y),
      new Vector(0, 0), 5,
    )

    this.score = 0;
    this.setScore = this.setScore.bind(this)

    this.angle = angle;
    this.steerAngle = 0.05;

    this.friction = 0.05;
    this.maxV = 14;


    this.cannon = new ParticleManager();

    document.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.cannon.push(new Bullet(
          this.copy(), Vector.fromAngle(this.angle, 20)
        ))
      }
      if (e.code === 'KeyW') {
        this.velocity = Vector.fromAngle(
          this.angle, this.cursor.mag() * 0.035)
      }
    })


  }

  setCursor(pos) {
    this.cursor = Vector.sub(pos, this);
  }

  setScore(score) {
    this.score += score;
  }


  render(canvas) {

    const ctx = canvas.getContext('2d')
    this.move(canvas);
    this.draw(ctx);

  }


  // draw spaceship
  draw(ctx) {

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle)

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-20, 20)
    ctx.lineTo(-20, -20)
    ctx.closePath();
    ctx.stroke();

    ctx.strokeRect(-28, -5 - 10, 8, 10);
    ctx.strokeRect(-28, 5, 8, 10);
    ctx.strokeRect(16, -1, 10, 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0)
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

  }

}


export default Ship;