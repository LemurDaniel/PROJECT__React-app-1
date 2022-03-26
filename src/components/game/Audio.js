import { useState, useEffect, useRef } from 'react'

const useAudio = () => {

    const origin = window.origin
    const [sounds, setSounds] = useState({});
    const soundRef = useRef(sounds);

    // Using ref so that the initial return play function always has the correct reference to the new sounds-object.
    soundRef.current = sounds;

    const getSoundEffects = async () => {

        try {
            let response = await fetch(origin + "/assets/sounds/soundeffects.json")
            response = await response.json()
            Object.keys(response).forEach(key => response[key] = new Audio(origin + response[key]))
            console.log(response)
            setSounds(response);
        } catch (exception) {
            console.log(exception)
        }

    }
    useEffect(getSoundEffects, [])

    const play = (filename, volume = 0.15, playSingle = false) => {

        if (!(filename in soundRef.current)) return;

        const audio = playSingle ? soundRef.current[filename] : new Audio(soundRef.current[filename].src);
        audio.volume = volume;
        audio.play();

    }

    return [play]
}


export default useAudio