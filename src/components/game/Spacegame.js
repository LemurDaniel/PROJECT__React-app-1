import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js';

import Timer from './Timer';
import Highscore from './Highscore';

import Vector from './modulesJs/Vector';
import Ship from './modulesJs/Spaceship';
import Asteroid from './modulesJs/Asteroids';
import ParticleManager from './modulesJs/Particle';


const MAX_ASTEROIDS = 40;
const SCALE = 2;
const ENGINE = Matter.Engine.create({
    gravity: {
        x: 0,
        y: 0,
    }
});

const data = {

    ship: null,
    asteroids: null,
    mousePos: {
        vec: new Vector(0, 0),
        draw: true,
    },

}

const Spacegame = () => {

    const initializeGame = () => {

        const c = canvasRef.current;
        const ship = new Ship();
      
        ship.velocity = new Vector(0, 0);
        ship.x = c.width / 2;
        ship.y = c.height / 2;
        ship.alive = true;
        ship.lives = 3;

        data.ship = ship;
        data.asteroids = new ParticleManager(ENGINE.world);


        setAstAmount(0);
        setScore(0);
        setTicks(0);
        setGameRunning(true);
        setPause(false);
    }


    const canvasRef = useRef(null);
    const [dimension, setDimension] = useState([window.innerWidth, window.innerHeight - 70])
    useEffect(() => {
        window.onresize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight - 70;
            setDimension([newWidth, newHeight])
        }

        initializeGame();
        window.onkeyup = e => {
            if (e.code === 'Space') data.ship.shoot();
            else if (e.code === 'KeyW' || e.code === 'ArrowUp') data.ship.thrust();
        }

        return () => window.onresize = null;
    }, [])
    useEffect(() => {
        const canvas = canvasRef.current;
        const width = dimension[0]
        const height = dimension[1]

        if (data.ship.x === 0 && data.ship.y === 0) {
            data.ship.x = width * SCALE / 2
            data.ship.y = height * SCALE / 2
        }

        canvas.height = height * SCALE;
        canvas.width = width * SCALE;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px';

    }, [canvasRef, dimension]);





    const [pause, setPause] = useState(false);

    const onMouseMove = e => {
        const canvas = canvasRef.current;
        const { ship, mousePos } = data;

        if (!ship || !gameRunning) return;

        if (e.type === 'touchmove' || e.type === 'touchstart') {
            const touch = e.nativeEvent.touches[0]
            mousePos.vec.x = (touch.clientX - canvas.offsetLeft) * SCALE;
            mousePos.vec.y = (touch.clientY - canvas.offsetTop) * SCALE;
            ship.setCursor(mousePos.vec);
            if (pause) setPause(false);
            ship.thrust(true);
        } else if (e.type === 'mousemove') {
            mousePos.vec.x = (e.clientX - canvas.offsetLeft) * SCALE;
            mousePos.vec.y = (e.clientY - canvas.offsetTop) * SCALE;
            ship.setCursor(mousePos.vec);
            if (pause) setPause(false);
        }

        if (e.type === 'touchstart') mousePos.draw = true;
        else if (e.type === 'touchend') mousePos.draw = false;
    }



    const [astAmount, setAstAmount] = useState(0);
    const [astTarget, setAstTarget] = useState(0);
    const [score, setScore] = useState(0);
    useEffect(() => {
        const amount = Math.floor(score / Math.pow(2, 13) * MAX_ASTEROIDS);
        setAstTarget(Math.max(4, amount));
    }, [score])
    useEffect(() => {
        const { ship, asteroids } = data;
        while (asteroids.count(true) < astTarget) {
            const ast = Asteroid.getRandom(canvasRef.current, ship);
            ast.setLimbo(Math.random() * 750 + 150);
            ast.setOnActive(() => setAstAmount(asteroids.count()));
            asteroids.push(ast);
        }
    }, [astTarget, astAmount]);



    const [gameRunning, setGameRunning] = useState(true);
    const [ticks, setTicks] = useState(0);
    useEffect(() => {
        if (ticks === 0) return;
        else if (ticks % (60 * 5) === 0) setScore(s => s + 125);
        else if (ticks % 60 === 0) setScore(s => s + 25);
        else if (ticks % 30 === 0) setScore(s => s + 5);
    }, [ticks]);



    useEffect(() => {
        const { ship, mousePos, asteroids, delta = 1000 / 60 } = data;

        if (!ship || !asteroids || !gameRunning) return;

        const loop = () => { 
   
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineWidth = 4;

            Matter.Engine.update(ENGINE, delta);
            const cannon = ship.cannon;
            asteroids.render(canvas);
            cannon.render(canvas)
            ship.render(canvas)

            if (mousePos.draw && !pause) {
                ctx.beginPath();
                ctx.arc(mousePos.vec.x, mousePos.vec.y, 5, 0, Math.PI * 2)
                ctx.fill();
            }


            // Collision dedection.
            asteroids.particles.forEach(asteroid => {
                cannon.calculateCollsision(asteroid, (collider, collided) => {
                    const points = Math.round(collided * (1 / canvas.width * 1000));
                    setScore(sc => sc + points);
                    setAstAmount(asteroids.count());
                })
                asteroids.calculateCollsision(ship, () => {
                    setAstAmount(asteroids.count());
                    if (ship.alive) return;
                    setGameRunning(false);
                    setPause(true);
                })
            });

        };

        // Draw on frame to make cursor dissapear.
        if (pause) return loop();

        const ticker = setInterval(() => loop(), delta);
        return () => clearInterval(ticker);
    }, [pause, gameRunning]);




    return (
        <div className="overflow-hidden select-none" >

            <div className="relative flex justify-evenly font-bold text-brand2-100" >
                <p className="absolute md:left-1/3 top-2">Highscore: {score}</p>
                <p className="absolute md:right-1/3 top-8 md:top-2">Asteroids: {astAmount} / {astTarget}</p>
                <div className="absolute right-4 md:right-12 top-2 md:top-2">
                    <Timer ticks={ticks} setTicks={setTicks} pause={pause || !gameRunning} />
                </div>
            </div>

            {gameRunning ? null : <Highscore score={score} ticks={ticks} gameRunning={gameRunning} onRestart={initializeGame} />}

            <div className="rounded-md">
                <canvas style={{ 'touch-action': 'none' }}
                    height={dimension[1]} width={dimension[0]} onMouseMove={onMouseMove} onClick={e => data.ship.shoot()}
                    onTouchMove={onMouseMove} onTouchEnd={onMouseMove} onTouchStart={onMouseMove}
                    onMouseLeave={e => setPause(true)} onMouseEnter={e => setPause(false)}
                    ref={canvasRef} className="" ></canvas>
            </div>


        </div>
    )
}

Spacegame.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight - 35
}

export default Spacegame
