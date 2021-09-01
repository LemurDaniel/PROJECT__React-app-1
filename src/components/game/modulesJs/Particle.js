import Vector from './Vector';
import Matter from 'matter-js';

class ParticleManager {

    constructor(matterWorld) {
        this.matterWorld = matterWorld;
        this.lastFrame = 0;
        this.limbo = [];
        this.particles = [];
        this.dying = [];

        // Call particle.onActive on all particles that are pushed to the particles array.
        this.particles.push = function (particle) {
            Array.prototype.push.call(this, particle)
            particle.onActive();
        }

    }



    get count() {
        return this.particles.length;
    }

    get limboCount() {
        return this.limbo.length;
    }

    onCountChanged(newCount, oldCount) { }

    push(prt) {
        if (prt.limbo > 0)
            this.limbo.push(prt)
        else
            this.particles.push(prt)
    }

    reset() {
        this.particles.forEach(prt => prt.onInActive());
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
                this.particles.push(prt);
            }
        }

        this.limbo.length = end + 1;
    }

    _checkDying(canvas) {

        const ctx = canvas.getContext('2d');

        let end = this.dying.length - 1;
        for (let i = 0; i <= end; i++) {

            const prt = this.dying[i];

            if (this.lastFrame !== Window.Frames) prt.fade();

            prt.render(canvas);

            if (prt.faded) {
                this.dying[i--] = this.dying[end--];
                prt.onInActive();
            }

        }

        this.dying.length = end + 1;
    }


    render(canvas) {

        const initialLength = this.particles.length;

        this._checkLimbo();
        this._checkDying(canvas);

        for (let i = 0; i < this.particles.length; i++) {

            const prt = this.particles[i];

            if (prt.alive)
                prt.render(canvas);
            else
                this._removeParticleAtIndex(i--);
        }

        if (initialLength !== this.particles.length)
            this.onCountChanged(this.particles.length, initialLength);

        this.lastFrame = Window.Frames;
    }

    _removeParticleAtIndex(index) {
        const prt = this.particles[index];
        const end = this.particles.length - 1;
        this.particles[index] = this.particles[end];
        this.particles.length = end;
        if (!prt.died) {
            this.dying.push(prt);
            prt.hidden = true;
        } else {
            prt.onInActive();
        }
    }

    _removeParticle(prt) {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].id !== prt.id) continue;
            return this._removeParticleAtIndex(i);
        }
    }

    // obsolete.
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

    get angle() {
        return this.matterBody.angle;
    }

    get mass() {
        return this.matterBody.mass;
    }

    set angle(angle) {
        Matter.Body.setAngle(this.matterBody, angle);
    }

    constructor(position, velocity, options) {
        super(position.x, position.y);

        const {
            lives = 1,
            radius = 0,
        } = options;

        delete options.lives;
        delete options.radius;

        this.matterBody = Matter.Body.create({
            ...options,
            plugin: {
                particleRef: this,
            }
        })

        Matter.Body.setPosition(this.matterBody, position.MatterVector);
        Matter.Body.setVelocity(this.matterBody, velocity.mul(Window.DrawScale).MatterVector);
        Matter.Body.setAngle(this.matterBody, velocity.heading());
        Matter.Body.scale(this.matterBody, Window.DrawScale, Window.DrawScale);

        this.seed = Math.random() * Number.MAX_SAFE_INTEGER;

        this.limbo = 0; // Time before Particle is active.
        this.lives = lives;
        this.alive = true;
        this.died = false;
        this.radius = radius * Window.DrawScale;
        this.velocity = velocity;
        this.vertices = options.vertices; 

        // obsolete
        this.collisions = {};
        this.id = Particle.id++;


        this.fadeTime = 8;
        this.fadeEnd = 5;
        this.hidden = false;
        this.faded = false;
        this.time = 0;
    }

    disableCollision() {
        this.matterBody.collisionFilter = {
            group: -1,
            category: 2,
            mask: 0,
        };
    }

    // obsolete.
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

        this.x = this.matterBody.position.x;
        this.y = this.matterBody.position.y;
        this.velocity.y = this.matterBody.velocity.y;
        this.velocity.x = this.matterBody.velocity.x;

        this.move(canvas);
        this.wrapBounds(canvas);

        Matter.Body.setPosition(this.matterBody, this.MatterVector);
        Matter.Body.setVelocity(this.matterBody, this.MatterVelocity);

        if (Window.Frames % 7 === 0)
            this.seed = Math.random() * Number.MAX_SAFE_INTEGER;


        if (this.hidden || this.died) return;
        ctx.setTransform(Window.DrawScale, 0, 0, Window.DrawScale, this.x, this.y);
        ctx.rotate(this.angle);
        this.draw(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    draw(ctx) { }

    move(canvas) { }

    onCollision(prt) { };

    onActive() {
        Matter.Composite.add(Window.MatterJSWorld, this.matterBody);
    }

    onInActive() {
        Matter.Composite.remove(Window.MatterJSWorld, this.matterBody);
    }
}


export default ParticleManager;
