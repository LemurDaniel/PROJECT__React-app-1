import { Particle } from './Particle'
import Vector from './Vector'

class Asteroid extends Particle {

    static targetAmount = 0;

    constructor(pos, velocity, radius, verts) {
        super(pos, velocity, radius);
        this.mass = Math.PI * radius * radius;
        this.verts = verts;

        this.setRotation();
    }

    setRotation() {
        this.rotation = 1;
        if(Math.round(Math.random()))   
            this.rotation = -1;
    }

    move(canvas) {
        this.velocity.limit(4);
        super.move(canvas);
        this.angle += this.velocity.heading() * 0.0055 * this.rotation;
        if(this.velocity.mag() < 0.15) this.velocity.setMag(Math.random()*(canvas.width*0.0025))
    }

    static getRandom(canvas, ship) {

        // The codeblock creates a position at the center of the screen
        // and moves it at an random angle outside of the screen.
        const pos = new Vector(canvas.width/2, canvas.height/2);
        const angle = Math.random() * (Math.PI*2);
        const move = Vector.fromAngle(angle, pos.mag()+10);
        pos.add(move);


        const direction = Vector.sub(ship, pos);
        const obfuscateAngle = direction.heading() - (Math.random() * Math.PI/16  - Math.PI/32)

        const velocity = Vector.fromAngle(obfuscateAngle, Math.random()*(canvas.width*0.0025) )
        const radius = Math.random()* (Math.min(canvas.width*0.035, 55)) + 8;

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


    draw(ctx) {

        super.draw(ctx);
        const verts = this.verts;

        ctx.beginPath();   
        ctx.moveTo(verts[0].x, verts[0].y);    
        for(let i=1; i<verts.length; i++) {
            ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // ctx.arc(0, 0, this.radius, 0, Math.PI*2)
        // ctx.stroke();

    }


    applyForce(velocity, mass) {
        const force = mass * velocity.mag();
        const mag = force / this.mass;
        const vec = Vector.fromAngle(velocity.heading(), mag);
        this.velocity.add(vec);
    }

    onCollision(ast) {

        const vel = this.velocity.copy();
        const vel2 = ast.velocity.copy();

        this.setRotation();
        ast.setRotation();

        this.velocity.setMag( this.velocity.mag() * -0.5 );
        ast.velocity.setMag( ast.velocity.mag() * -0.5 );

        ast.applyForce(vel, this.mass);
        this.applyForce(vel2, ast.mass);


        let dist;
        let maximum =  75;
        const temp = this.velocity.copy().setMag(0.1);
        const temp2 = ast.velocity.copy().setMag(0.1);
        do {
            /// console.log(dist)
            dist = this.dist(ast);
            this.add(temp)
            ast.add(temp2);
        } while(--maximum && dist <= this.radius + ast.radius);
        

        if(this.dist(ast) <= this.radius + ast.radius) {
            const temp = Vector.add(this.velocity, ast.velocity);
            this.velocity = temp.copy().setMag( Math.abs(this.velocity.mag()) *1);
            ast.velocity = temp.copy().setMag( Math.abs(ast.velocity.mag()) *-1)

            maximum = 75;
            do {
                /// console.log(dist)
                dist = this.dist(ast);
                this.add(this.velocity)
                ast.add(ast.velocity);
            } while(--maximum && dist <= this.radius + ast.radius);
        }
    }

}


export default Asteroid;