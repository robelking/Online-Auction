import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import Loader from '../Loader/Loader';
import { useAlert } from 'react-alert';
import CartProduct from './cartProducts';
import "../UpdateLots/updateLotstyle.scss";
import "../HomePage/homestyle.scss";

const MyCart = () => {


  const { loading } = useSelector((state) => state.cart);
  const cartlist = JSON.parse(localStorage.getItem("cartItems"));
  

  return (
    <>{loading ? (<Loader />) : (

      <>
        <div className=" updatelotcls" data-aos="fade-up" data-aos-delay="400">
          <div className='row'>
            <div className='col-10 mx-auto'>

              <section className="product_section layout_padding">
                <div className="container">
                  <div className="heading_container heading_center">
                    <div className="section-title" data-aos="fade-up">
                      <h2>My Cart</h2>
                      <p>Auctions you watchlisted</p>
                    </div>

                  </div>
                  <div className="row">
                    
                    {cartlist && cartlist.map(product => (
                      <CartProduct product={product} />
                    ))}

                  </div>

                </div>
              </section>

            </div>
          </div>
        </div>
      </>

    )}</>
  );

};

export default MyCart;
