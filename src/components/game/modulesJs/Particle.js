import Vector from './Vector';


class ParticleManager {

    constructor(matterWorld) {
        this.matterWorld = matterWorld;
        this.limbo = [];
        this.particles = [];
        this.dying = [];
    }


    count(includeLimbo) {
        return this.particles.length + (includeLimbo ? this.limbo.length : 0);
    }

    push(prt) {
        if (prt.limbo > 0) this.limbo.push(prt)
        else this.pushParticle(prt)
    }

    pushParticle(prt) {
        prt.pm = this;
        this.particles.push(prt);
        prt.onActive(this.matterWorld);
    }

    reset() {
        this.limbo = [];
        this.particles = [];
        this.dying = [];
    }

    _checkLimbo() {

        let end = this.limbo.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.limbo[i];

            if (--prt.limbo <= 0) {
                this.limbo[i--] = this.limbo[end--];
                this.pushParticle(prt);
            }
        }

        this.limbo.length = end + 1;
    }

    _checkDying(canvas) {

        const ctx = canvas.getContext('2d');

        let end = this.dying.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.dying[i];

            prt.fade();
            prt.move(canvas)
            if (!prt.hidden) prt.draw(ctx);

            if (prt.faded)
                this.dying[i--] = this.dying[end--];

        }

        this.dying.length = end + 1;
    }


    render(canvas) {

        this._checkLimbo();
        this._checkDying(canvas);

        for (let i = 0; i < this.particles.length; i++) {

            const prt = this.particles[i];

            if (prt.alive) 
                prt.render(canvas);
            else 
                this._removeParticleAtIndex(i--);
        }

    }

    _removeParticleAtIndex(index) {
        const prt = this.particles[index];
        const end = this.particles.length - 1;
        this.particles[index] = this.particles[end];
        this.particles.length = end;
        if (!prt.died) {
            this.dying.push(prt);
            prt.hidden = true;
        }
    }

    _removeParticle(prt) {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].id !== prt.id) continue;
            return this._removeParticleAtIndex(i);
        }
    }


    calculateCollsisions(collider, afterCollision) {

        const particles = this.particles;

        for (let i = 0; i < particles.length; i++) {

            const prt = particles[i];

            if (!prt.isColliding(collider)) continue;

            // On Collision.
            const resultCollider = collider.onCollision(prt);
            const resultCollided = prt.onCollision(collider);

            // Remove dead particles.
            if (!prt.alive) this._removeParticleAtIndex(i--);
            if (!collider.alive) collider._removeSelf();

            if (afterCollision)
                afterCollision(resultCollider, resultCollided, collider, prt);

            if (!collider.alive) break;
        }

    }
}


export class Particle extends Vector {

    static id = 0;

    get MatterVelocity() {
        return this.velocity.MatterVector;
    }

    constructor(pos, velocity, radius, lives = 1) {
        super(pos.x, pos.y);
        this.id = Particle.id++;

        this.pm = null;
        this._onActive = [];

        this.limbo = 0; // Time before Particle is active.
        this.lives = lives;
        this.alive = true;
        this.died = false;
        this.angle = 0;
        this.radius = radius;
        this.velocity = velocity;
        this.collisions = {};


        this.fadeTime = 8;
        this.fadeEnd = 5;
        this.hidden = false;
        this.faded = false;
        this.time = 0;
    }

    _removeSelf() {
        this.pm._removeParticle(this);
    }

    setLimbo(time, onActive) {
        this.limbo = Math.round(time);
    }

    setOnActive(onActive) {
        this._onActive.push(onActive);
    }

    isColliding(collider) {
     
        if (!this.alive || !collider.alive) return false;
        if (this === collider) return false;

        // Prevent double calculating and handling of collisions.
        if (collider.id in this.collisions) return false;

        // Calculate distance.
        const dist = this.dist(collider);
        const collided = dist <= this.radius + collider.radius

        this.collisions[collider.id] = collided;
        collider.collisions[this.id] = collided;
        return collided;
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
        if (this.time++ >= this.fadeTime) {
            this.time = 0;
            this.hidden = !this.hidden;
            this.fadeTime = this.fadeTime * 0.95;
        }

        if (this.fadeTime < this.fadeEnd) this.faded = true;
    }

    render(canvas) {
        const ctx = canvas.getContext('2d')
        this.collisions = {};
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

    onActive(world) {
        this._onActive.forEach(handler => handler());
    }


}


export default ParticleManager;
