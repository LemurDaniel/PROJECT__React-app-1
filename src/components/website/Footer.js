import React from 'react'

import { BiCopyright } from 'react-icons/bi';
import { SiTailwindcss, SiMysql, SiLetsencrypt } from 'react-icons/si';
import { IoLogoNodejs, IoLogoReact, IoLogoGithub } from 'react-icons/io5';
import { IoLogoJavascript, IoLogoLinkedin, IoLogoXing } from 'react-icons/io';


const Footer = () => {

    const icon = "inline mx-1 w-5 h-5 hover:bg-white hover:text-dark-700 rounded-full duration-300"
    return (

        <footer className="py-2 w-full bg-dark-100   fixed bottom-0   flex justify-evenly text-white text-xs  font-bold">

        <div>
            <p className="px-2 inline "> <BiCopyright className="inline" /> <span className="font-extralight">copyright 2021 - </span> LemurDaniel</p>
            <a href="https://github.com/LemurDaniel/PROJECT__React-app-1"> <IoLogoGithub className={icon} /> </a>
            <a href="https://www.xing.com/profile/Daniel_Landau8/"> <IoLogoXing className={icon} /> </a>
            <a href="https://www.linkedin.com/in/daniel-landau-ab2417188/"> <IoLogoLinkedin className={icon} /> </a>
        </div>
        
        <div>
            <p className="px-2 inline">Technologies </p>
            <a href="https://www.javascript.com/"> <IoLogoJavascript className={icon} /> </a>
            <a href="https://reactjs.org/"> <IoLogoReact className={icon} /> </a>
            <a href="https://tailwindcss.com/"> <SiTailwindcss className={icon} /> </a>
            <a href="https://nodejs.org/en/"> <IoLogoNodejs className={icon} /> </a>
            <a href="https://letsencrypt.org/de/"> <SiLetsencrypt className={icon} /> </a>
            <a href="https://www.mysql.com/de/"> <SiMysql className={icon} /> </a>
        </div>

        </footer>

    )

}

export default Footer;