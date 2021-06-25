import React from 'react'

import { BiCopyright } from 'react-icons/bi';
import { SiTailwindcss, SiMysql, SiLetsencrypt } from 'react-icons/si';
import { IoLogoJavascript, IoLogoLinkedin, IoLogoXing } from 'react-icons/io';
import { IoLogoNodejs, IoLogoReact, IoLogoGithub, IoLogoDocker } from 'react-icons/io5';


const Footer = () => {

    return (

        <footer className="py-0 sm:py-1 w-full  absolute md:fixed bottom-0   flex flex-col md:flex-row justify-evenly  bg-dark-100 text-white text-xs font-bold">

            <div className="mx-auto md:mx-0  py-1 sm:py-0  block sm:hidden ">
                <a href="/impressum" className="font-extralight hover:underline "> Datenschutz & Impressum </a>
            </div>

            <div className="mx-auto md:mx-0  py-1 sm:py-0   border-gray-700 border-t sm:border-t-0">
                <a href="/impressum" className="font-extralight hover:underline    hidden sm:inline"> Datenschutz & Impressum </a>
                <p className="px-2 inline "> <BiCopyright className="inline" /> <span className="font-extralight">copyright 2021 - </span> LemurDaniel</p>
                <a href="https://github.com/LemurDaniel/PROJECT__React-app-1">  <IoLogoGithub className="footer-icon" /> </a>
                <a href="https://www.xing.com/profile/Daniel_Landau8/">         <IoLogoXing className="footer-icon" /> </a>
                <a href="https://www.linkedin.com/in/daniel-landau-ab2417188/"> <IoLogoLinkedin className="footer-icon" /> </a>
            </div>

            <div className="mx-auto md:mx-0   py-1 sm:py-0   border-gray-700 border-t sm:border-t-0">
                <p className="px-2 inline">Technologies </p>
                <a href="https://www.javascript.com/">  <IoLogoJavascript className="footer-icon" /> </a>
                <a href="https://nodejs.org/en/">       <IoLogoNodejs className="footer-icon" /> </a>
                <a href="https://reactjs.org/">         <IoLogoReact className="footer-icon" /> </a>
                <a href="https://tailwindcss.com/">     <SiTailwindcss className="footer-icon" /> </a>
                <a href="https://www.docker.com/">      <IoLogoDocker className="footer-icon" />  </a>
                <a href="https://letsencrypt.org/de/">  <SiLetsencrypt className="footer-icon" /> </a>
                <a href="https://www.mysql.com/de/">    <SiMysql className="footer-icon" /> </a>
            </div>

        </footer>

    )

}

export default Footer;