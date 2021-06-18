import React from 'react'

const Image = ({ key, image }) => {

    return (
        <div key={key} className="my-2 mx-auto md:mx-1 md:w-52 rounded-md text-brand2-100 text-center text-lg bg-dark-800 shadow-2xl ">
            <h1 className="mb-2 font-bold text-dark-700 bg-brand2-100 border-t rounded-t-md">{image.name}</h1>

            <img className="pb-2 w-72 md:w-full rounded-sm mx-auto" alt={image.name}
                src={'http://localhost/doodles/' + image.path} />

<div className="py-2 flex justify-evenly md:block md:text-sm" >
            <p>{image.userDisplayName}</p>
            <p>{image.ml5}</p>
            <p>{image.ml5_conf}</p>
            </div>

        </div>
    )
}

export default Image
