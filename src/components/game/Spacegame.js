import React, { useEffect, useRef, useState } from 'react'

import Timer from './Timer';
import Highscore from './Highscore';

import Vector from './modulesJs/Vector';
import Ship from './modulesJs/Spaceship';
import Asteroid from './modulesJs/Asteroids';
import ParticleManager from './modulesJs/Particle';


const MAX_ASTEROIDS = 40;
const SCALE = 2;
const ship = new Ship(0, 0, 0)
const asteroids = new ParticleManager();
const mousePos = {
    vec: new Vector(0, 0),
    draw: true,
}


const Spacegame = () => {

    const canvasRef = useRef(null);
    const [dimension, setDimension] = useState([window.innerWidth, window.innerHeight - 70])
    useEffect(() => {
        const setSize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight - 70;
            setDimension([newWidth, newHeight])
        }
        window.onresize = setSize;
        window.onkeyup = e => {
            if (e.code === 'Space') ship.shoot();
            else if (e.code === 'KeyW' || e.code === 'ArrowUp') ship.thrust();
        }

        return () => window.onresize = null;
    }, [])
    useEffect(() => {
        const canvas = canvasRef.current;
        const width = dimension[0]
        const height = dimension[1]

        if (ship.x === 0 && ship.y === 0) {
            ship.x = width * SCALE / 2
            ship.y = height * SCALE / 2
        }

        canvas.height = height * SCALE;
        canvas.width = width * SCALE;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px';

    }, [canvasRef, dimension]);





    const [pause, setPause] = useState(false);

    const onMouseMove = e => {
        const canvas = canvasRef.current;

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
        const amount = Math.floor(score / Math.pow(2, 13)  * MAX_ASTEROIDS);
        setAstTarget(Math.max(4, amount));
    }, [score])
    useEffect(() => {
        while (asteroids.count(true) < astTarget) {
            const ast = Asteroid.getRandom(canvasRef.current, ship);
            ast.setLimbo(Math.random() * 750 + 150, () => setAstAmount(asteroids.count()));
            asteroids.push(ast);
        }
    }, [astTarget, astAmount]);



    const [gameRunning, setGameRunning] = useState(true);
    const [ticks, setTicks] = useState(0);
    useEffect(() => {
        if(ticks === 0) return;
        else if (ticks % (60 * 5) === 0) setScore(s => s + 125);
        else if (ticks % 60 === 0) setScore(s => s + 25);
        else if (ticks % 30 === 0) setScore(s => s + 5);
    },[ticks]);


    const onRestart = () => {

        const c = canvasRef.current;
        ship.velocity = new Vector(0, 0);
        ship.x = c.width / 2;
        ship.y = c.height / 2;
        ship.alive = true;
        ship.lives = 3;
        asteroids.reset();
        setAstAmount(0);
        setScore(0);
        setTicks(0);
        setGameRunning(true);
        setPause(false);
    }


    useEffect(() => {
        if (!ship || !asteroids || !gameRunning) return;
        const loop = () => {

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineWidth = 4;

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
            asteroids.particles.forEach(prt => {
                asteroids.calculateCollsision(ship, () => {
                    setAstAmount(asteroids.count());
                    if (ship.alive) return;
                    setGameRunning(false);
                    setPause(true);
                })
                asteroids.calculateCollsision(prt);
            });

            cannon.particles.forEach(bullet => {
                asteroids.calculateCollsision(bullet, result => {
                    const points = Math.round( result * (1/canvas.width*1000) );
                    setScore( sc => sc + points);
                    setAstAmount(asteroids.count());
                })
            })

        };

        // Draw on frame to make cursor dissapear.
        if (pause) return loop();

        const ticker = setInterval(() => loop(), 1000 / 60);
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

            {gameRunning ? null : <Highscore score={score} ticks={ticks} gameRunning={gameRunning} onRestart={onRestart} />}

            <div className="rounded-md">
                <canvas style={{ 'touch-action': 'none' }}
                    height={dimension[1]} width={dimension[0]} onMouseMove={onMouseMove} onClick={e => ship.shoot()}
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