
import ParticleManager, { Particle } from './Particle';
import Vector from './Vector'




class Bullet extends Particle {

  constructor(pos, velocity) {
    super(pos, velocity, 10);
    this.add(Vector.mul(velocity, 1))
    this.angle = this.velocity.heading();
  }

  move(canvas) {
    // super.move(canvas);
    this.add(this.velocity)
    this.alive = !this.isOOB(canvas);
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.fillRect(10, -2.5, 20, 5);
  }

  onCollision(ast) {

    ast.alive = false
    this.alive = false;

    return Math.floor(ast.mass / (Math.random() * 10 + 100));
  }

}


class Ship extends Particle {

  constructor(x, y, angle) {
    super(
      new Vector(x, y),
      new Vector(0, 0), 5, 3
    )

    this.faded = true;
    this.cursor = new Vector(1, 1);
    this.friction = 0.05;
    this.maxV = 14;

    this.cannon = new ParticleManager();

    document.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.shoot();
      }
      if (e.code === 'KeyW') {
        this.thrust();
      }
    })


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

    if(!this.faded) {
      this.fade();
      if(this.hidden) return;
    }

    super.draw(ctx);
    this.drawShip(ctx);
  }

  drawLives(ctx) {
    
    const canvas = ctx.canvas;
    ctx.setTransform(1,0,0,1, canvas.width*0.05, canvas.height*0.035)

    //ctx.font = 'bold 44px arial';
    //ctx.fillText('Lives: ', x, 20);

    const size = 0.8;
    ctx.scale(size,size)
    ctx.rotate(-Math.PI/4)

    for(let i=0; i<this.alive; i++) {
      this.drawShip(ctx);
      ctx.translate(60*size, 60*size);
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

  }

  onCollision(ast) {
    console.log('ass')
    ast.alive = false;
    this.alive--;

    this.faded = false;
    this.hidden = true;
    this.fadeTime = 12;
    this.fadeEnd = 12;
  }

}




export default Ship;