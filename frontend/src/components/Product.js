import React from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Rating from './Rating'
import './headerStyle.css'
import Sentiment_Rating from "../components/Sentiment_rating";

function Product({product}) {
    return (
        <Card className="Navbar_style my-3 p-3 rounded">
            <Link to = {`/product/${product._id}`}>
                <Card.Img src={product.image}/>
            </Link>
            <Card.Body>
            <Link to href = {`/product/${product._id}`}>
                <Card.Title as="div">
                    <strong>{product.name}</strong>
                </Card.Title>
            </Link>
            <Card.Text as="div">
                <div className="my-3">
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color={"#874356"}
                />
                    {/* <Sentiment_Rating
                  value={product.sentiment_rating}
                  text={` ${product.sentiment_rating*100}%`}
                  color={"#874356"}
                /> */}
                </div>
            </Card.Text>
            <Card.Text as="h4">
                Rs.{product.price}
            </Card.Text>

            </Card.Body>
        </Card>
    )
}

export default Product
