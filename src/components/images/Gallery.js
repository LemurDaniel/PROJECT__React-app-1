import React, { useContext, useState } from 'react'

import { BsInfoSquareFill } from 'react-icons/bs'

import UserContext from '../UserContext'
import Searchbar from './Searchbar';
import Image from './Image';
import Loading from '../website/Loading';

const Gallery = () => {

    const { meta } = useContext(UserContext);

    const [hash, setHash] = useState(null)
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchImages = async (name, user, label) => {

        try {    
            setLoading(true);

            const res = await fetch(meta.endpoint+`/images?name=${name}&user=${user}&ml5=${label}&hash=${hash}`)
            const data = await res.json();

            setLoading(false);
            
            if(data.hash === hash) return;
            setHash(data.hash);

            for(let image of data.result) 
                image.ml5_conf = Math.floor(image.ml5_conf * 10000) / 100 + ' %';
            
            setImages(data.result);
   
        } catch (err) {
            setLoading(false);
            console.log(err)
        }
    }

    return (
        <div className="shadow-2xl">

            <Searchbar onSearch={searchImages} />

            <div className="pt-4 md:mx-0 md:flex flex-row flex-wrap justify-evenly relative">

                { !loading ? null :
                    <div className="bg-transparent rounded-full absolute top-2">
                        <Loading  />
                    </div>
                }

                { images.length > 0 ?
                    images.map( image => <Image key={image.id}  image={image}/> )  
                    :
                    <div className="py-12 text-2xl text-center text-brand2-100">
                        <i> <BsInfoSquareFill className="inline" />  No Images found </i>
                    </div>
                }
            </div>

        </div>
    )
}

export default Gallery
