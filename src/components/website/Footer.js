import React from 'react'

import { BiCopyright } from 'react-icons/bi';
import { SiTailwindcss, SiMysql, SiLetsencrypt } from 'react-icons/si';
import { IoLogoNodejs, IoLogoReact, IoLogoGithub } from 'react-icons/io5';
import { IoLogoJavascript, IoLogoLinkedin, IoLogoXing } from 'react-icons/io';


const Footer = () => {

    return (

        <footer className="pt-1 w-full   absolute md:fixed bottom-0   flex flex-col md:flex-row justify-evenly   bg-dark-100 text-white text-xs font-bold">

            <div className="mx-auto mx:mx-0  pb-1">
                <p className="px-2 inline "> <BiCopyright className="inline" /> <span className="font-extralight">copyright 2021 - </span> LemurDaniel</p>
                <a href="https://github.com/LemurDaniel/PROJECT__React-app-1">  <IoLogoGithub   className="footer-icon" /> </a>
                <a href="https://www.xing.com/profile/Daniel_Landau8/">         <IoLogoXing     className="footer-icon" /> </a>
                <a href="https://www.linkedin.com/in/daniel-landau-ab2417188/"> <IoLogoLinkedin className="footer-icon" /> </a>
            </div>

            <div className="mx-auto mx:mx-0   py-1 md:py-0  border-gray-700 border-t md:border-t-0">
                <p className="px-2 inline">Technologies </p>
                <a href="https://www.javascript.com/">  <IoLogoJavascript   className="footer-icon" /> </a>
                <a href="https://reactjs.org/">         <IoLogoReact        className="footer-icon" /> </a>
                <a href="https://tailwindcss.com/">     <SiTailwindcss      className="footer-icon" /> </a>
                <a href="https://nodejs.org/en/">       <IoLogoNodejs       className="footer-icon" /> </a>
                <a href="https://letsencrypt.org/de/">  <SiLetsencrypt      className="footer-icon" /> </a>
                <a href="https://www.mysql.com/de/">    <SiMysql            className="footer-icon" /> </a>
            </div>

        </footer>

    )

}

export default Footer;