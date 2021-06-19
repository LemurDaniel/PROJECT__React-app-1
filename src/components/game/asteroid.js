import { Particle } from './particle'
import Vector from './Vector'

class Asteroid extends Particle {

    constructor(pos, velocity, radius, verts) {
        super(pos, velocity, radius);
        this.mass = Math.PI * radius * radius;
        this.angle = 0;
        this.verts = verts;
    }

    move(canvas) {
        this.velocity.limit(4);
        super.move(canvas);
        this.angle += this.velocity.heading()*0.010;
    }

    static getRandom(canvas, ship) {

        // The codeblock creates a position at the center of the screen
        // and moves it at an random angle outside of the screen.
        const pos = new Vector(canvas.width/2, canvas.height/2);
        const angle = Math.random() * (Math.PI*2);
        const move = Vector.fromAngle(angle, pos.mag()+10);
        pos.add(move);


        const direction = Vector.sub(ship, pos);
        const obfuscateAngle = direction.heading() - (Math.random() * Math.PI/8  - Math.PI/16)
        const velocity = Vector.fromAngle(obfuscateAngle, Math.random()*3 + 1)

        const radius = Math.random()*25 + 8;

        const verts = [];
        for( let i=Math.PI*2; i>=0; i -= Math.PI/8 ) {
            const range = radius * 0.65;
            const rand = Math.random()* range - range/2;

            const x = Math.cos(i) * (radius + rand);
            const y = Math.sin(i) * (radius + rand);
    
            verts.push(new Vector(x, y));
        }

        return new Asteroid(pos, velocity, radius, verts);
    }


    drawLine(ctx, vec, vec2) {
        const start = Vector.fromAngle(vec.heading()+this.angle, vec.mag()).add(this);
        const end = Vector.fromAngle(vec2.heading()+this.angle, vec2.mag()).add(this);

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    draw(ctx) {

        const verts = this.verts;

        ctx.beginPath();       
        for(let i=1; i<verts.length; i++) {
            this.drawLine(ctx, verts[i-1], verts[i])
        }
        this.drawLine(ctx, verts[verts.length-1], verts[0])
        ctx.closePath();

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2)
        ctx.stroke();
    }


    applyForce(velocity, mass) {
        const force = mass * velocity.mag();
        const mag = force / this.mass;
        const vec = Vector.fromAngle(velocity.heading(), mag);
        this.velocity.add(vec);
    }

    onCollision(ast) {

        ast.collisionCalculated = true;
        this.collisionCalculated = true;

        const vel = this.velocity.copy();
        const vel2 = ast.velocity.copy();


        this.velocity.setMag( this.velocity.mag() * -0 );
 
        ast.velocity.setMag( ast.velocity.mag() * -0 );

        ast.applyForce(vel, this.mass);
        this.applyForce(vel2, ast.mass);

        let dist;
        const temp = this.velocity.copy().setMag(0.01);
        const temp2 = ast.velocity.copy().setMag(0.01);
        do {
            dist = this.dist(ast);
            this.add(temp)
            ast.add(temp2);
        } while(dist <= this.radius + ast.radius);

    }

}


export default Asteroid;