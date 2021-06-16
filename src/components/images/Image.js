import React from 'react'

const Image = ({ key, image }) => {

    return (
        <div key={key} className="p-2 px-5 my-2 mx-auto md:mx-1 md:w-48 rounded-md text-center text-lg bg-dark-800 shadow-2xl text-brand2-100">
            <h1 className="font-bold text-brand2-100">{image.name}</h1>
            <div className="pt-1" >
                <img className="w-72 md:w-full rounded-sm mx-auto"  alt={image.name} 
                    src={'http://localhost/doodles/'+image.path} />
                <p>by {image.userDisplayName}</p>
                <p>{image.ml5}</p>
                <p>{image.ml5_conf}</p>
            </div>

        </div>
    )
}

export default Image
