import React, { useContext } from 'react'
import UserContext from '../UserContext'

const Image = ({ key, image }) => {

    const { meta } = useContext(UserContext)
  
    return (
        <div key={key} className="image-card">
            <h1>{image.name}</h1>

            <img alt={image.name} src={meta.endpoint + '/doodles/' + image.path} />

            <div>
                <p>{image.userDisplayName}</p>
                <p>{image.ml5}</p>
                <p>{image.ml5_conf}</p>
            </div>

        </div>
    )
}

export default Image
