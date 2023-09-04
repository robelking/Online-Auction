import React, { useContext, useEffect } from 'react';
import "./signupstyle.scss";
import { useState } from 'react';
import axios from 'axios';
import login from '../images/login.svg';
import register from '../images/register.svg';
import 'font-awesome/css/font-awesome.min.css';
import { NavLink, useHistory } from 'react-router-dom';
import { UserContext } from '../../App';
import { useAlert } from 'react-alert';
import { auth, provider } from "../../firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { signInWithPopup } from 'firebase/auth';
import { FaRegistered } from 'react-icons/fa';


// import {RiLockPasswordFill} from 'react-icons/ri';


const Signup = () => {
  const alert = useAlert();
  const { state, dispatch } = useContext(UserContext);
  const [flag, setFlag] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [google, setGoogle] = useState("");
  const history = useHistory();

  //  signUp page 
  const [user, setUser] = useState({
    name: "", email: "", phone: "", password: "", cpassword: ""
  });
  // , 

  let name, value;

  const handleInputs = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value });
  }

  const PostData = async (e) => {
    e.preventDefault();
    //Sending to Database

    const { name, email, phone, password, cpassword } = user;

    await axios.post("http://localhost:5000/register", {
      headers: {
        "Content-type": "application/json"
      },
      body: {
        name, email, phone: '012346', password, cpassword
      }

    }).then(async (res) => {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).then((user) => {
        alert.success("Registerd Successfuly")
        setFlag(!flag)
      }).catch((err) => {
        console.log(err)
        alert.error("Registerd Unsuccessfuly ")
      })
    }).catch((error) => {
      console.log(error)
      alert.error(error.response.data.error)
    })


  }
  // SignUp page End


  // signin Page

  const loginUser = async (e) => {

    //   if(this.state.value.length < 8) {
    //     return false;
    // }

    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        localStorage.setItem('user', JSON.stringify(user));
        history.push('/')
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode)
        alert.error(errorMessage)
      });
    // const res = await fetch('/signin', {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/json"
    //   },
    //   body: {
    //     email,
    //     password
    //   }
    // });

    // const data = res.json();

    // if (res.status === 400 || !data) {
    //   // window.alert("Invalid Credential");
    //   alert.error("Invalid Credential");

    // } else {
    //   dispatch({ type: "USER", payload: true });
    //   // window.alert("login Successful");
    //   alert.success("login Successful");

    //   history.push('/');

    // }

  }

  //Google Authentication
  // const handleGoogle = () => {
  //   console.log("google auth");
  //   signInWithPopup(auth, provider).then((data) => {
  //     setGoogle(data.user.email)
  //     localStorage.setItem("email", data.user.email)
  //     history.push("/")
  //   })
  // }
  // useEffect(() => {
  //   setGoogle(localStorage.getItem("email"))

  // }, [])

  const handleGoogle = async (e) => {
    e.preventDefault();
     await signInWithPopup(
        auth,
        provider
      ).then((response) => {
        const data = response.user;
        axios.post("http://localhost:5000/google",  data )
      })
        .then((user) => {
          alert.success("Registered successfully")
          setFlag(!flag)
        }).catch((err) => {
          console.log(err)
          alert.error("Registered unsuccessfully")
        }).catch((error) => {
      console.log(error)
      alert.error(error.response.data.error)
    })

    // signInWithPopup(auth, provider).then((data) => {
    //   const email = data.user.email;
    //   axios.post("http://localhost:5000/register", { email })  // Sending data to the backend
    //     .then(response => {
    //       history.push("/");
    //     })
    //     .catch((err) => {
    //       // Handle error
    //       console.log(err)
    //       alert.error("Registerd Unsuccessfuly ")
    //     });
    // });
  }

  useEffect(() => {
    axios.get("http://localhost:5000/register")
      .then(response => {
        setGoogle(response.data.email);
      })
      .catch(error => {
        // Handle error
      });
  }, []);


  return (
    <>
      {/* <h1>Signup Page</h1> */}
      <div className=" signupcls" data-aos="fade-up" data-aos-delay="400">
        <div className='row'>
          <div className='col-10 mx-auto'>

            {/* Sign in */}
            <div className={`container ${flag ? 'sign-up-mode' : null}`}>
              <div className="forms-container">
                <div className="signin-signup">
                  <form method='POST' className="sign-in-form">
                    <h2 className="title">Sign in</h2>
                    <div className="input-field">
                      <i className="fas fa-user"></i>
                      <input type="email" placeholder="Email" name='email' autoComplete='off' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-field">
                      <i className="fas fa-lock"></i>
                      <input type="password" placeholder="Password" name='password' autoComplete='off' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <input type="submit" value="Login" className="btn solid" name='signin' onClick={loginUser} />
                    <p className="social-text">Or Sign in with social platforms</p>
                    <div className="social-media">
                      <a href="#" className="social-icon">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i className="fab fa-google"></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </form>

                  {/* SignUp */}
                  <form method='POST' className="sign-up-form">
                    <h2 className="title">Sign up</h2>

                    <div className="input-field">
                      <i className="fas fa-user"></i>
                      <input type="text" name="name" placeholder="Username" autoComplete='off'
                        value={user.name}
                        onChange={handleInputs}
                      />
                    </div>

                    <div className="input-field">
                      <i className="fas fa-envelope"></i>
                      <input type="email" name="email" placeholder="Email" autoComplete='off'
                        value={user.email}
                        onChange={handleInputs}
                        required
                      />
                    </div>

                    {/* <div className="input-field">
                      <i className="fas fa-envelope"></i>
                      <input type="tel" name="phone" placeholder="Phone Number" autoComplete='off' pattern="[0-9]{10}"
                        value={user.phone}
                        onChange={handleInputs}
                      />

                    </div> */}

                    <div className="input-field">
                      <i className="fas fa-lock"></i>
                      <input type="password" name="password" placeholder="Password" autoComplete='off'
                        value={user.password}
                        onChange={handleInputs}
                        required
                      />
                    </div>

                    <div className="input-field">
                      <i className="fas fa-lock"></i>
                      <input type="password" name="cpassword" placeholder="Conform Password" autoComplete='off'
                        value={user.cpassword}
                        onChange={handleInputs}
                        required
                      />
                    </div>

                    <input type="submit" className="btn" name='signup' value="Sign up" onClick={PostData} />

                    <p className="social-text">Or Sign up with social platforms</p>
                    <div className="social-media">
                      <a href="#" class="social-icon">
                        <i className="fab fa-facebook-f"  ></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i onClick={handleGoogle} className="fab fa-google"></i>
                      </a>
                      <a href="#" className="social-icon">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </form>
                </div>
              </div>

              <div className="panels-container">
                <div className="panel left-panel">
                  <div className="content">
                    <h3>Haven't an account?</h3>
                    <p>
                      Get Started with a free account!!

                    </p>
                    <NavLink excat className="nav-link-signup" to="/signup">
                      <button className="btn transparent" id="sign-up-btn" onClick={() => setFlag(!flag)}>
                        Sign up
                      </button></NavLink>
                  </div>
                  <img src={register} className="image" alt="" />
                </div>
                <div className="panel right-panel">
                  <div className="content">
                    <h3>Already have an account?</h3>
                    <p>
                      Log in first to start with bestbid!!
                    </p>
                    <NavLink excat className="nav-link-signin" to="/signin">
                      <button className="btn transparent" id="sign-in-btn" onClick={() => setFlag(!flag)}>
                        Sign in
                      </button></NavLink>
                  </div>
                  <img src={login} className="image" alt="" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>



    </>
  );
};

export default Signup; 