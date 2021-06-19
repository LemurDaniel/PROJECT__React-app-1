import Vector from './Vector';


class ParticleManager {

    constructor() {
        this.particles = [];
    }


    count() {
        return this.particles.length;
    }

    push(prt) {
        this.particles.push(prt)
    }

    render(canvas) {

        const particles = this.particles;
        const ctx = canvas.getContext('2d');

        let end = particles.length;
        for (let i = 0; i < end; i++) {

            const prt = particles[i];
            prt.collisions.length = 0;

            if(prt.alive) {
                prt.move(canvas);
                prt.draw(ctx);
            }
            else {
                particles[i] = particles[end - 1];
                end--;
                i--;
            }

        }

        particles.length = end;

    }

    calculateCollsision(collider, afterCollision) {

        const particles = this.particles;

        let end = particles.length;
        for (let i = 0; i < end; i++) {

            const prt = particles[i];

            if (!prt.alive) continue;
            if (prt === collider) continue;
            
            // The array get reset after each render.
            // This is to prevent doubly handling of the same collision in the same frame.
            if(prt.collisions.includes(collider)) continue;

            // Calculate distance.
            const dist = prt.dist(collider);
            if (dist >= prt.radius + collider.radius) continue;

            // On Collision.
            const result = collider.onCollision(prt);
            collider.collisions.push(prt);
            prt.collisions.push(collider);

            // Remove dead particles.
            if(!prt.alive) {
                particles[i] = particles[end-1];
                particles.length = end-1;
                end--;
                i--;
            }

            if(afterCollision) afterCollision(result, collider, prt);

            if(!collider.alive) return;
        }


    }

}


export class Particle extends Vector {

    constructor(pos, velocity, radius) {
        super(pos.x, pos.y);
        this.alive = true;
        this.angle = 0;
        this.radius = radius;
        this.velocity = velocity;
        this.collisions = [];
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
