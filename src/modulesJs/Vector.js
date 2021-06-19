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

    static sub(vec, vec2) {
        return vec.copy().sub(vec2);
    }

    static add(vec, vec2) {
        return vec.copy().add(vec2);
    }

    static mul(vec, vecOrMul, mul2) {
        return vec.copy().mul(vecOrMul, mul2);
    }


    _round() {
        if (Math.abs(this.x) < 10e-10) this.x = 0;
        if (Math.abs(this.y) < 10e-10) this.y = 0;
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dist(vec) {
        return Vector.sub(this, vec).mag();
    }

    limit(limit) {
        if (this.mag() > limit) return this.setMag(limit);
    }

    setMag(mag) {
        const angle = this.heading();
        this.x = Math.cos(angle) * mag;
        this.y = Math.sin(angle) * mag;
        this._round();
        return this;
    }

    heading() {
        const TAU = Math.PI * 2;

        if (this.x === 0)
            return this.y > 0 ? (Math.PI / 2) : (Math.PI * 3 / 2);

        if (this.x > 0)
            return (TAU + Math.atan(this.y / this.x)) % TAU;

        if (this.x < 0)
            return Math.PI + Math.atan(this.y / this.x);

    }

    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this._round();
        return this;
    }

    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this._round();
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
        this._round();
        return this;
    }


}


export default Vector;