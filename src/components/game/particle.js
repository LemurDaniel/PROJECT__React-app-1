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
            prt.collisionCalculated = false
            prt.move(canvas);
            prt.draw(ctx);

            if (!prt.alive) {
                particles[i] = particles[end - 1];
                end--;
                i--;
            }

        }

        particles.length = end;

    }

    calculateCollsision(collider, score) {

        const particles = this.particles;

        for (let prt of particles) {

            if (!prt.alive) continue;
            if (prt === collider) continue;
            if (prt.collisionCalculated) continue;

            const dist = prt.dist(collider);
            if (dist >= prt.radius + collider.radius) continue;

            const val = collider.onCollision(prt);
            if(score) score(val);

            if(!collider.alive) return;

        }

    }

}


export class Particle extends Vector {

    constructor(pos, velocity, radius) {
        super(pos.x, pos.y);
        this.alive = true;
        this.radius = radius;
        this.velocity = velocity;

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
    }

}


export default ParticleManager;
