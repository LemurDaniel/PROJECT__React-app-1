import React from 'react'

const Image = ({ key, image }) => {

    return (
        <div key={key} className="image-card">
            <h1>{image.name}</h1>

            <img alt={image.name} src={'http://localhost/doodles/' + image.path} />

            <div>
                <p>{image.userDisplayName}</p>
                <p>{image.ml5}</p>
                <p>{image.ml5_conf}</p>
            </div>

        </div>
    )
}

export default Image
