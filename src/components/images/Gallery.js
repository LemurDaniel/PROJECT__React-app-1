import React, { useContext, useState, useEffect } from 'react'

import { BsInfoSquareFill } from 'react-icons/bs'

import UserContext from '../UserContext'
import Searchbar from './Searchbar';
import Image from './Image';

const Gallery = () => {

    const { token } = useContext(UserContext);
    const [hash, setHash] = useState(null)
    const [images, setImages] = useState([]);

    const searchImages = async (name, user, label) => {

        try {    
            const res = await fetch(`http://localhost/images?name=${name}&user=${user}&ml5=${label}&hash=${hash}&token=${token}`)
            const data = await res.json();

            for(let image of data.data) 
                image.ml5_conf = Math.floor(image.ml5_conf * 10000) / 100 + ' %';
            
            console.log(data)
            setImages(data.data);
            setHash(data.hash);
        
        } catch (err) {
            console.log(err)
        }

    }

    return (
        <div className="shadow-2xl">
            
            <Searchbar onSearch={searchImages} />
            <div className="md:mx-0 md:flex flex-row flex-wrap justify-evenly">

                { images.length > 0 ?
                    images.map( image => <Image image={image}/> )  
                    :
                    <i className="mx-auto py-10 text-2xl text-brand2-100">
                        <BsInfoSquareFill className="inline" />  No Images found
                    </i>
                }
            </div>

        </div>
    )
}

export default Gallery
