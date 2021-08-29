import { Particle } from './Particle'
import Vector from './Vector'
import Matter from 'matter-js';

const someVariableWithoutADescriptiveName = 0.0038;

class Asteroid extends Particle {

    static targetAmount = 0;

    constructor(pos, velocity, radius, verts) {
        super(pos, velocity, radius);
        this.mass = Math.PI * radius * radius;
        this.verts = verts;

        const angVel = Math.log(this.mass) * 0.0025 * (Math.round(Math.random()) === 0 ? 1 : -1);

        this.matterBody = Matter.Body.create({
            label: 'asteroid',
            frictionAir: 0,
            friction: 0,
            density: 1,
            mass: this.mass,
            restitution: 0.65,
            plugin:{
                particleRef: this,
            }
        })

        Matter.Body.setVertices(this.matterBody, verts.map(vert => vert.MatterVector));
        Matter.Body.setPosition(this.matterBody, this.MatterVector);
        Matter.Body.setVelocity(this.matterBody, this.MatterVelocity)
        Matter.Body.setAngularVelocity(this.matterBody, angVel)
    }

    onActive(particleManager) {
        this.pm = particleManager;
        Matter.Composite.add(this.pm.matterWorld, this.matterBody);
    }

    onDying() {
        this.matterBody.collisionFilter = {
            group: -1,
            category: 2,
            mask: 0,
        };
    }

    onDeath() {
        Matter.Composite.remove(this.pm.matterWorld, this.matterBody);
    }

    move(canvas) {

        this.angle = this.matterBody.angle;
        this.x = this.matterBody.position.x;
        this.y = this.matterBody.position.y;
        this.velocity.x = this.matterBody.velocity.x;
        this.velocity.y = this.matterBody.velocity.y;

        const vel = canvas.width * someVariableWithoutADescriptiveName;
        if (this.velocity.mag() < 0.55)
            this.velocity.setMag(Math.random() * vel)

        this.velocity.limit(Math.min(vel, Math.random() * 4 + 9));
        super.wrapBounds(canvas);

        Matter.Body.setPosition(this.matterBody, this.MatterVector);
        Matter.Body.setVelocity(this.matterBody, this.MatterVelocity);

    }

    static getRandom(canvas, ship) {

        // The codeblock creates a position at the center of the screen
        // and moves it at an random angle outside of the screen.
        const pos = new Vector(canvas.width / 2, canvas.height / 2);
        const angle = Math.random() * (Math.PI * 2);
        const move = Vector.fromAngle(angle, pos.mag() + 10);
        pos.add(move);


        const direction = Vector.sub(ship, pos);
        const obfuscateAngle = direction.heading() - (Math.random() * Math.PI / 32 - Math.PI / 64)

        const velocity = Vector.fromAngle(obfuscateAngle,
            Math.random() * (canvas.width * someVariableWithoutADescriptiveName)
        )

        const max = Math.min(canvas.width * 0.055, 55);
        const min = canvas.width * 0.015;
        const radius = Math.random() * max + min;

        const verts = [];
        for (let i = Math.PI * 2; i >= 0; i -= Math.PI / 8) {
            const range = radius * 0.65;
            const rand = Math.random() * range - range / 2;

            const x = Math.cos(i) * (radius + rand);
            const y = Math.sin(i) * (radius + rand);

            verts.push(new Vector(x, y));
        }

        return new Asteroid(pos, velocity, radius, verts);
    }


    draw(ctx) {

        super.draw(ctx);
        const verts = this.verts;

        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) {
            ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
        ctx.stroke();

    }

}


export default Asteroid;