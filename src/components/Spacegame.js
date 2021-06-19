import React, { useEffect, useRef, useState } from 'react'

import Vector from '../modulesJs/Vector';
import Ship from '../modulesJs/Spaceship';
import Asteroid from '../modulesJs/Asteroids';
import ParticleManager, { Particle } from '../modulesJs/Particle';



const MAX_ASTEROIDS = 30;
const SCALE = 2;
const height = 500;
const width = 800;


const Spacegame = () => {

    const canvasRef = useRef(null);
    const [ship, setShip] = useState(null);
    const [asteroids, setAsteroids] = useState(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        canvas.height = height * SCALE;
        canvas.width = width * SCALE;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px';

        // Scale and translate origin once.
        canvas.getContext('2d').scale(SCALE, SCALE);

        setShip(new Ship(canvas.width / 2, canvas.height / 2, 0));
        setAsteroids(new ParticleManager());

        return () => canvas.getContext('2d').scale(-SCALE, -SCALE);
    }, [canvasRef]);





    const [gameRunning, setGameRunning] = useState(true);


    const [cursor, setCursor] = useState(true);
    const [mousePos, setMousePos] = useState(new Vector());
    const onMouseMove = e => {
        const canvas = canvasRef.current;
        mousePos.x = (e.clientX - canvas.offsetLeft) * SCALE;
        mousePos.y = (e.clientY - canvas.offsetTop) * SCALE;
        setMousePos(mousePos);
    }


    const [astAmount, setAstAmount] = useState(0);
    const [astTarget, setAstTarget] = useState(7);
    const [score, setScore] = useState(7);
    useEffect(() => {
        if (!ship || !asteroids || !gameRunning) return;
        let localScore = score;

        const loop = () => {

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (Math.round(Math.random() * 25) === 0 && asteroids.count() < astTarget) {
                asteroids.push(Asteroid.getRandom(canvas, ship));
                setAstAmount(asteroids.count());
            }

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
                asteroids.particles.forEach(prt =>
                    asteroids.calculateCollsision(bullet, result => {
                        localScore += result;
                        setScore(localScore);
                        setAstAmount(asteroids.count());
                        setAstTarget(Math.max(4, score / 200));
                    })
                );
            })

        };

        // Draw on frame to make cursor dissapear.
        if (!cursor) return loop();

        const ticker = setInterval(() => loop(), 1000 / 60);
        return () => clearInterval(ticker);
    }, [ship, asteroids, cursor, gameRunning]);




    return (
        <div className="w-min mx-auto ">


            <p>Highscore: {score}</p>
            <p>Asteroids: {astAmount} / {astTarget}</p>

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
