class Vector {

    constructor(x, y) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }


    static fromAngle(angle, mag) {
        const y = Math.sin(angle) * mag;
        const x = Math.cos(angle) * mag;
        return new Vector(x, y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setMag(mag) {
        const angle = this.heading();
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;

        if(Math.abs(this.x) < 10e-10) this.x = 0;
        if(Math.abs(this.y) < 10e-10) this.y = 0
        return this;
    }

    heading() {
        if (this.x === 0) {
            if (this.y > 0) return Math.PI / 2;
            else return Math.PI * 3 / 2;
        }
        if (this.x > 0) {
            const angle = Math.atan(this.y / this.x);
            return angle < 0 ? 2 * Math.PI + angle : angle;
        }
        if (this.x < 0) {
            return Math.PI + Math.atan(this.y / this.x);
        }
    }

    limit(limit) {
        if (this.mag() <= limit) return;
        else this.setMag(limit);
        return this;
    }

    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        if(Math.abs(this.x) < 10e-10) this.x = 0;
        if(Math.abs(this.y) < 10e-10) this.y = 0
        return this;
    }

    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        if(Math.abs(this.x) < 10e-10) this.x = 0;
        if(Math.abs(this.y) < 10e-10) this.y = 0
        return this;
    }

    mul(vec, m) {
        if (typeof vec === 'number') {
            this.x *= vec;
            this.y *= m ?? vec;
        } else {
            this.x *= vec.x;
            this.y *= vec.y;
        }
        if(Math.abs(this.x) < 10e-10) this.x = 0;
        if(Math.abs(this.y) < 10e-10) this.y = 0
        return this;
    }

    static sub(vec, vec2) {
        return new Vector(vec.x, vec.y).sub(vec2);
    }

    static add(vec, vec2) {
        return new Vector(vec.x, vec.y).add(vec2);
    }

    static mul(vec, mul, mul2) {
        return new Vector(vec.x, vec.y).mul(mul, mul2);
    }

    dist(vec) {
        const dist = Vector.sub(this, vec);
        return dist.mag();
    }

    copy() {
        return new Vector(this.x, this.y);
    }
}


export default Vector;