import React, { useEffect, useRef, useState } from 'react'

import Vector from '../modulesJs/Vector';
import Ship from '../modulesJs/Spaceship';
import Asteroid from '../modulesJs/Asteroids';
import ParticleManager, { Particle } from '../modulesJs/Particle';



const MAX_ASTEROIDS = 30;
const SCALE = 2;
const ship = new Ship(0, 0, 0)
const asteroids = new ParticleManager();
const mousePos = { x: 0, y: 0 }


const Spacegame = ({ width, height }) => {

    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        canvas.height = height * SCALE;
        canvas.width = width * SCALE;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px';

        // Scale and translate origin once.
        canvas.getContext('2d').scale(SCALE, SCALE);
        ship.x = width * SCALE / 2
        ship.y = height * SCALE / 2;

        return () => canvas.getContext('2d').scale(-SCALE, -SCALE);
    }, [canvasRef, width, height]);





    const [gameRunning, setGameRunning] = useState(true);



    const [gameRunning, setGameRunning] = useState(true);
    const [cursor, setCursor] = useState(true);

    const onMouseMove = e => {
        const canvas = canvasRef.current;
        mousePos.x = (e.clientX - canvas.offsetLeft) * SCALE;
        mousePos.y = (e.clientY - canvas.offsetTop) * SCALE;
    }



    const [astAmount, setAstAmount] = useState(0);
    const [astTarget, setAstTarget] = useState(4);
    useEffect(() => {
        const add = () => {
            if (asteroids.count() >= astTarget) return;
            asteroids.push(Asteroid.getRandom(canvasRef.current, ship));
            setAstAmount(asteroids.count());
        };

        setTimeout(add, Math.random() * 1000 + 75)
    }, [astAmount, astTarget])


    const [score, setScore] = useState(0);
    useEffect(() => {
        setAstTarget( Math.max(12, Math.ceil(score / 75)) );
    }, [score])
    useEffect(() => {
        if (!ship || !asteroids || !gameRunning) return;
        let localScore = score;

        const loop = () => {

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineWidth = 4;

            const cannon = ship.cannon;
            asteroids.render(canvas);
            cannon.render(canvas)
            ship.setCursor(mousePos);
            ship.render(canvas)

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            if (cursor) {
                ctx.beginPath();
                ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2)
                ctx.fill();
            }


            // Collision dedection.
            asteroids.particles.forEach(prt => {
                asteroids.calculateCollsision(ship, () => {
                    // setGameRunning(false);
                })
                asteroids.calculateCollsision(prt);
            });

            cannon.particles.forEach(bullet => {
                asteroids.calculateCollsision(bullet, result => {
                    localScore += result;
                    setScore(localScore);
                    setAstAmount(asteroids.count());
                });
            })

        };

        // Draw on frame to make cursor dissapear.
        if (!cursor) return loop();

        const ticker = setInterval(() => loop(), 1000 / 60);
        return () => clearInterval(ticker);
    }, [cursor, gameRunning]);




    return (
        <div className="w-min mx-auto ">


            <div className="font-bold text-brand2-100  flex justify-evenly">
                <p>Highscore: {score}</p>
                <p>Asteroids: {astAmount} / {astTarget}</p>
            </div>

            <div className="rounded-md border border-brand2-100">
                <canvas
                    height={height} width={width} onMouseMove={onMouseMove}
                    onMouseLeave={e => setCursor(false)} onMouseEnter={e => setCursor(true)}
                    ref={canvasRef} className="bg-dark-800" ></canvas>
            </div>
        </div>
    )
}

export default Spacegame
