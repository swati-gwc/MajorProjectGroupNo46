import React from 'react'

function Sentiment_Rating( {value, text , color}) {
    return (
        <div className="sentiment_rating"> 
            <span>
                <i style={{color}} className={
                    value >= 0.1 ? 'fas fa-heart ' : value >= -9 ? 'far fa-heart ':'far fa-heart '
                }>
                </i>
            </span>
            <span>
                <i style={{color}} className={
                    value >= 0.25 ? 'fas fa-heart ' : value >= 0.125? 'fas fa-map-marker ':'far fa-heart '
                }>
                </i>
            </span>
            <span>
                <i style={{color}} className={
                    value >= 0.50 ? 'fas fa-heart ' : value >= 0.375  ? 'fas fa-map-marker ':'far fa-heart '
                }>
                </i>
            </span>
            <span>
                <i style={{color}} className={
                    value >= 0.75 ? 'fas fa-heart ' : value >= 0.625 ? 'fas fa-map-marker ':'far fa-heart '
                }>
                </i>
            </span>
            <span>
                <i style={{color}} className={
                    value >= 1 ? 'fas fa-heart ' : value >= 0.875 ? 'fas fa-map-marker ':'far fa-heart '
                }>
                </i>
            </span>
            <span>{text && text}</span>
        </div>
    )
}

export default Sentiment_Rating
