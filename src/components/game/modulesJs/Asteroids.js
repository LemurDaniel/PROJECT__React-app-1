import { Particle } from './Particle'
import Vector from './Vector'
import Matter from 'matter-js';

class Asteroid extends Particle {

    static targetAmount = 0;

    constructor(pos, velocity, radius, verts) {
        super(pos, velocity, radius);
        this.mass = Math.PI * radius * radius;
        this.verts = verts;

        this.matterBody = Matter.Body.create({
            frictionAir: 0,
            friction: 0,
        })
        Matter.Body.setVelocity(this.matterBody, this.MatterVelocity)
        Matter.Body.setPosition(this.matterBody, this.MatterVector);
        Matter.Body.setMass(this.matterBody, this.mass*10);
        Matter.Body.setVertices(this.matterBody, verts.map(vert => vert.MatterVector));

        this.setRotation();
    }

    onActive(world) {
        super.onActive(world);
        Matter.Composite.add(world, this.matterBody);
        console.log(world)
    }

    setRotation() {
        this.rotation = 1;
        if (Math.round(Math.random()))
            this.rotation = -1;
    }

    move(canvas) {

        this.x = this.matterBody.position.x;
        this.y = this.matterBody.position.y;
        super.wrapBounds(canvas);
        Matter.Body.setPosition(this.matterBody, this.MatterVector)

        return;
        this.velocity.limit(4);
        super.move(canvas);
        this.angle += this.velocity.heading() * 0.0055 * this.rotation;
        if (this.velocity.mag() < 0.15) this.velocity.setMag(Math.random() * (canvas.width * 0.0025))
    }

    static getRandom(canvas, ship) {

        // The codeblock creates a position at the center of the screen
        // and moves it at an random angle outside of the screen.
        const pos = new Vector(canvas.width / 2, canvas.height / 2);
        const angle = Math.random() * (Math.PI * 2);
        const move = Vector.fromAngle(angle, pos.mag() + 10);
        pos.add(move);


        const direction = Vector.sub(ship, pos);
        const obfuscateAngle = direction.heading() - (Math.random() * Math.PI / 16 - Math.PI / 32)

        const velocity = Vector.fromAngle(obfuscateAngle, Math.random() * (canvas.width * 0.0055))

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