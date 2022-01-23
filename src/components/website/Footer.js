import React from 'react'

import { BiCopyright } from 'react-icons/bi';
import { SiTailwindcss, SiMysql, SiLetsencrypt } from 'react-icons/si';
import { IoLogoJavascript, IoLogoLinkedin, IoLogoXing } from 'react-icons/io';
import { IoLogoNodejs, IoLogoReact, IoLogoGithub, IoLogoDocker } from 'react-icons/io5';


const Footer = () => {

    return (

        <footer className="p-0 md:py-1 md:px-12 w-full  absolute md:fixed bottom-0   flex flex-col lg:flex-row justify-between  bg-dark-100 text-white text-xs font-bold">


            <div className="order-1 mx-auto md:mx-0 py-1 md:py-0   block md:hidden">
                <a href="https://www.youtube.com/watch?v=w7ejDZ8SWv8" className="font-extralight hover:underline  pr-1">
                    Traversy Media's Tutorial
                </a>
                <a href="/impressum" className="font-extralight hover:underline   border-l pl-1">
                    Datenschutz & Impressum
                </a>
            </div>


            <div className="order-2 mx-auto lg:mx-0  py-1 md:py-0   border-gray-700 border-t md:border-t-0     font-extralight">
                <a href="/impressum" className="border-r px-2  hover:underline  hidden md:inline">
                    Datenschutz & Impressum
                </a>
                <p className="px-2 inline "> <BiCopyright className="inline" />
                    copyright 2021 - <span className="font-bold"> LemurDaniel </span>
                </p>
                <a href="https://github.com/LemurDaniel/PROJECT__React-app-1">  <IoLogoGithub className="footer-icon" /> </a>
                <a href="https://www.xing.com/profile/Daniel_Landau8/">         <IoLogoXing className="footer-icon" /> </a>
                <a href="https://www.linkedin.com/in/daniel-landau-ab2417188/"> <IoLogoLinkedin className="footer-icon" /> </a>
            </div>



            <div className="order-3 mx-auto lg:mx-0   py-1 lg:py-0   border-gray-700 border-t md:border-0    md:order-1 lg:order-3">
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