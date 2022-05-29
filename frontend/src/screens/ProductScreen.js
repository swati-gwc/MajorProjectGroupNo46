import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listProductDetails, createProductReview } from "../actions/productActions";
import Loader from "../components/Loader";
import Message from "../components/Message";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Card,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "../components/Rating";
import Sentiment_Rating from "../components/Sentiment_rating";

import { PRODUCT_CREATE_RESET, PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants'
import '../components/headerStyle.css';
function ProductScreen({ match, history }) {
  const [qty, setQty] = useState(1)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const dispatch = useDispatch();
  
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const { loading: loadingProductReview, error: errorProductReview, success: successProductReview } = productReviewCreate;

  useEffect(() => {
    if(successProductReview){
      setRating(0)
      setComment('')
      dispatch({type: PRODUCT_CREATE_REVIEW_RESET})
    }
    dispatch(listProductDetails(match.params.id));
  }, [dispatch, match, successProductReview]);

  const addToCartHandler = () => {
    history.push(`/cart/${match.params.id}?qty=${qty}`)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(createProductReview(
      match.params.id, {
        rating,
        comment
      }
    ))
  }

  return (
    <div >
      <Link to="/" className="btn btn-light my-3">
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <h3>{product.name}</h3>
            <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name} fluid />
          </Col>

          {/* <Col md={3}>
            <ListGroup variant="flush">
               <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item> 
              <ListGroup.Item>
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color={"#f8e825"}
                />
              </ListGroup.Item>

              <ListGroup.Item>Price: Rs. {product.price}</ListGroup.Item>

              <ListGroup.Item>
                Description: {product.description}
              </ListGroup.Item>
            </ListGroup>
          </Col> */}

          <Col md={4} className="cart_desc_style">
            <Card className="cart_desc_style">
              <ListGroup variant="flush" className="cart_desc_style">
                <ListGroup.Item className="cart_desc_style" >
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>Rs. {product.price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item className="cart_desc_style">
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                    </Col>
                  </Row>
                </ListGroup.Item>

              {
                product.countInStock> 0 && (
                  <ListGroup.Item className="cart_desc_style"> 
                    <Row>
                      <Col>Qty</Col>
                      <Col xs='auto' className='my-1'>
                        <Form.Control
                          as="select"
                          value = {qty}
                          onChange = {(e)=> setQty(e.target.value)}
                        >
                          {
                             [...Array(product.countInStock).keys()].map((x) => (
                               <option key = {x+1} value= {x+1}>
                                 {x + 1}
                               </option>
                             ))
                          }
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              }

                <ListGroup.Item className="cart_desc_style">
                  <Button
                    onClick = {addToCartHandler}
                    className="btn-block"
                    disabled={product.countInStock == 0}
                    type="button"
                  >
                    Add to Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
        <Row>
        <Col md={6} >
            <ListGroup variant="flush" className="cart_desc_style">
              
                <h3>Description</h3>
                <ListGroup.Item className="cart_desc_style">
                {product.description}
              </ListGroup.Item>
              <ListGroup.Item className="cart_desc_style">
                <h4>sentiment based rating </h4>
                <Sentiment_Rating
                  value={product.sentiment_rating}
                  text={` Likeability = ${product.sentiment_rating*100} %`}
                  color={"#FF4949"}
                />
               
              </ListGroup.Item>
              <ListGroup.Item className="cart_desc_style">
                <h4>Rating by customers</h4>
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color={"#FF8D29"}
                />
                <hr/>
              </ListGroup.Item>

              {/* <ListGroup.Item>Price: Rs. {product.price}</ListGroup.Item> */}

             
            </ListGroup>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            
            <ListGroup variant='flush'>

           
              <ListGroup.Item className="give_feedback_style">
                <h4>Give your feedback</h4>

                {loadingProductReview && <Loader />}
                {successProductReview && <Message variant='success'>Feedback Submitted</Message>}
                {errorProductReview && <Message variant = 'danger'>{errorProductReview}</Message>}

                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                     <Form.Group controlId='rating'>
                      <Form.Label>
                        Rating
                      </Form.Label>
                      <Form.Control as='select' value ={rating} onChange ={(e)=> setRating(e.target.value)}>
                        <option value=''>Select...</option>
                        <option value='1'>1 - Terrible</option>
                        <option value='2'>2 - Bad</option>
                        <option value='3'>3 - Okay</option>
                        <option value='4'>4 - Good</option>
                        <option value='5'>5 - Great</option>
                      </Form.Control>
                    </Form.Group> 
                    <Form.Group controlId='comment'>
                    <Form.Label>
                        Describe your experience about the product below
                      </Form.Label>
                      <Form.Control
                        as='textarea'
                        row = '5'
                        value = {comment}
                        onChange = {(e)=> setComment(e.target.value)}
                      >

                      </Form.Control>
                    </Form.Group>
                    <Button 
                      disabled = {loadingProductReview}
                      type = 'submit'
                      variant ='primary'
                    >
                      Submit your feedback
                    </Button>
                   
                  </Form>
                ): (
                  <Message variant='info'>Please <Link to='/login'>login</Link> to give feedback</Message>
                )}
                 <br/>
              </ListGroup.Item>
              <ListGroup.Item className="cart_desc_style">  <h4>feedback by customers ({product.numReviews}) </h4></ListGroup.Item>
            
            {product.reviews.length === 0 && <Message variant='info'>No feedback yet !</Message>}
              {product.reviews.map((review)=>(
                <ListGroup.Item className="cart_desc_style" key={review._id}>
                  <strong>Customer: {review.name}</strong> 
                   <Rating value = {review.rating} color='#f8e825'/> 
                   <p>Feedback: {review.comment}</p>
                   {/* <p>Sentiment is {review.sentiment_predicted}</p>  */}
                   <p>{review.sentiment_predicted == 1 ? 'Sentiment : positive':review.sentiment_predicted == 0 ? 'Sentiment : negative': null}</p>
                   <p>Sarcasm Detected: {review.sarcasm_detected}</p>
                   {/* <p>[Review added on:{review.createdAt.substring(0,10)}]</p> */}
                </ListGroup.Item>
              ))}

            </ListGroup>
          </Col>
        </Row>
        </div>
        
      )}
    </div>
  );
}

export default ProductScreen;
