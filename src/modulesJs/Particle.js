import Vector from './Vector';


class ParticleManager {

    constructor() {
        this.limbo = [];
        this.particles = [];
        this.dying = [];
    }


    count(includeLimbo) {
        return this.particles.length + (includeLimbo ? this.limbo.length : 0);
    }

    push(prt) {
        if(prt.limbo > 0) this.limbo.push(prt)
        else this.particles.push(prt)
    }


    _checkLimbo() {

        let end = this.limbo.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.limbo[i];

            if(--prt.limbo <= 0) {
                this.limbo[i--] = this.limbo[end--];
                this.particles.push(prt);
                prt.onActive();
            }
        }

        this.limbo.length = end+1;
    }

    _checkDying(canvas) {

        const ctx = canvas.getContext('2d');

        let end = this.dying.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.dying[i];

            prt.fade();
            prt.move(canvas)
            if(!prt.hidden) prt.draw(ctx);

            if(prt.faded) 
                this.dying[i--] = this.dying[end--];

        }

        this.dying.length = end+1;
    }


    render(canvas) {

        this._checkLimbo();
        this._checkDying(canvas);

        let end = this.particles.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.particles[i];

            prt.collisions = {}; // reset collisions for this frame.

            if(prt.alive) prt.render(canvas);
            else this.particles[i--] = this.particles[end--];

        }

        this.particles.length = end+1;
    }

    calculateCollsision(collider, afterCollision) {

        const particles = this.particles;

        let end = particles.length-1;
        for (let i = 0; i <= end; i++) {

            const prt = particles[i];

            if (!prt.alive) continue;
            if (prt === collider) continue;
            
            // Prevent double calculating and handling of collisions.
            if(collider.id in prt.collisions) continue;
            
            // Calculate distance.
            const dist = prt.dist(collider);
            if (dist >= prt.radius + collider.radius) {
                prt.collisions[collider.id] = false;
                collider.collisions[prt.id] = false;
                continue;
            }
            prt.collisions[collider.id] = true;
            collider.collisions[prt.id] = true;


            // On Collision.
            const result = collider.onCollision(prt);

            // Remove dead particles.
            if(!prt.alive) {
                particles[i--] = particles[end--];
                particles.length = end+1;
                if(!prt.died) {
                    this.dying.push(prt);
                    prt.hidden = true;
                }
            }

            if(afterCollision) afterCollision(result, collider, prt);
            if(!collider.alive) break;
        }

    }

}


export class Particle extends Vector {

    static id = 0;

    constructor(pos, velocity, radius, lives = 1) {
        super(pos.x, pos.y);
        this.id = Particle.id++;

        this.limbo = 0; // Time before Particle is active.
        this.alive = lives;
        this.died = false;
        this.angle = 0;
        this.radius = radius;
        this.velocity = velocity;
        this.collisions = {};

 
        this.fadeTime =  8;
        this.fadeEnd = 5;
        this.hidden = false;
        this.faded = false;
        this.time = 0;
    }

    setLimbo(time, onActive) {
        this.limbo = Math.round(time);
        this.onActive = onActive ?? (() => null);
    }

    isOOB(canvas) {
        if (this.x > canvas.width + this.radius * 2) return true;
        if (this.y > canvas.height + this.radius * 2) return true;
        if (this.x < 0 - this.radius * 2) return true;
        if (this.y < 0 - this.radius * 2) return true;
        return false;
    }

    wrapBounds(canvas) {
        if (this.x > canvas.width + this.radius * 2 + 5)
            this.x = -this.radius * 2;
        else if (this.x < -this.radius * 2 - 5)
            this.x = canvas.width + this.radius * 2;

        if (this.y > canvas.height + this.radius * 2 + 5)
            this.y = -this.radius * 2;
        else if (this.y < -this.radius * 2 - 5)
            this.y = canvas.height + this.radius * 2;
    }

    fade() {
        if(this.time++ >= this.fadeTime) {
            this.time = 0;
            this.hidden = !this.hidden;
            this.fadeTime = this.fadeTime*0.95;
        }

        if(this.fadeTime < this.fadeEnd) this.faded = true;
    }

    render(canvas) {
        const ctx = canvas.getContext('2d')
        this.move(canvas);
        this.draw(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    move(canvas) {
        this.add(this.velocity);
        this.wrapBounds(canvas);
    }

    draw(ctx) { 
        ctx.setTransform(1, 0, 0, 1, this.x, this.y);
        ctx.rotate(this.angle);
    }

    onCollision(prt) {
        return 0;
    }
}


export default ParticleManager;
