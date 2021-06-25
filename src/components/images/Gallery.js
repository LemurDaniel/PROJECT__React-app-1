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

            const res = await fetch(meta.endpoint + `/images?name=${name}&user=${user}&ml5=${label}&hash=${hash}`)
            const data = await res.json();

            if (data.hash !== hash) {
                for (let image of data.result)
                    image.ml5_conf = Math.floor(image.ml5_conf * 10000) / 100 + ' %';

                setHash(data.hash);
                setImages(data.result);
            };

        } catch (err) {
            ;
            console.log(err)
        }

        // Some fake time for a nice spinning circle animation.
        window.setTimeout(() => setLoading(false), 750);

    }

    return (
        <div className="mx-10 md:mx-40  mt-10  pb-24 md:pb-16">
            <div className="pb-2 shadow-2xl">

                <Searchbar onSearch={searchImages} />

                <div className="pt-4 md:mx-0 md:flex flex-row flex-wrap justify-evenly   ">

                    {loading ?
                        <div className="bg-transparent rounded-full mx-auto w-min">
                            <Loading loading={loading} />
                        </div>
                        :
                        (
                            images.length > 0 ? images.map(image => <Image key={image.id} image={image} />)
                                :
                                <div className="py-12 text-2xl text-center text-brand2-100">
                                    <i> <BsInfoSquareFill className="inline" />  No Images found </i>
                                </div>
                        )}
                </div>

            </div>
        </div>
    )
}

export default Gallery
