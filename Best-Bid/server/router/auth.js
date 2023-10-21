const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticate = require("../middleware/authenticate");


require('../db/conn');
const User = require("../model/userSchema");

router.get('/', (req, res) => {
    res.send(`Router js is called`);
});

router.post('/register', async (req, res) => {
    console.log('register page is called');
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const { name, email, phone, password, cpassword, firebaseUID } = req.body.body;


    if (!name || !email || !phone || !password || !cpassword) {
        return res.status(400).json({ error: "Fill all Require Feild Properly " });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "password should be minimum 8 characters" });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Incorrect Email format" });
    }
    try {

        const userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(400).json({ error: "Email already exist" });
        }
        else if (password != cpassword) {
            return res.status(400).json({ error: "password is not matching" })

        }
        else {

            if (!firebaseUID) {
                return res.status(400).json({ error: "firebaseUID cannot be null" });
                
            }
            

            const existingUserWithFirebaseUID = await User.findOne({ firebaseUID: firebaseUID });

            if (existingUserWithFirebaseUID) {
                return res.status(400).json({ error: "firebaseUID already exists" });
            }

            const user = new User({  name, email, phone, firebaseUID });
            

            // Hashing is Used


            await user.save().then((res)=> {
                
            });
            

            res.status(201).json({ message: " User register successfuly" });


        }



    } catch (err) {

        console.log(err);
    }




});
//Google Auth

router.post('/google', async (req, res) => {
   
    const { displayName, email, uid, photoURL } = req.body.body.googleData.user;
    const { phone } = req.body.body
    try {

        const userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(400).json({ error: "Email already exist" });
        }
        else {

            if (!uid) {
                return res.status(400).json({ error: "firebaseUID cannot be null" });
                
            }
            

            const existingUserWithFirebaseUID = await User.findOne({ firebaseUID: uid });

            if (existingUserWithFirebaseUID) {
                return res.status(400).json({ error: "firebaseUID already exists" });
            }
            const name = displayName;
            const firebaseUID = uid;
            const profile = photoURL;

            const user = new User({  name, email, phone, firebaseUID, profile });
            

            // Hashing is Used


            await user.save().then((res)=> {
                
            });
            

            res.status(201).json({ message: " User register successfuly" });


        }



    } catch (err) {

        console.log(err);
    }

});


//signin

router.post('/signin', async (req, res) => {

    try {
        let token;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "invalid credentials" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "invalid credentials" });
        }
        console.log(password.length);
        const userLogin = await User.findOne({ email: email });


        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);





            if (!isMatch) {
                res.status(400).json({ error: "invalid credential" });
            } else {
                token = await userLogin.generateAuthToken();
                console.log(token);

                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 25892000000),
                    httpOnly: true
                });
                res.json({ message: "user sign in successfully" })
            }
        } else {
            res.status(400).json({ error: "Invalid Credential" })
        }




    } catch (err) {
        console.log(err);
    }

});




// ABOUT US PAGE ROUTE
// we have to use authenticatrion middleware at about page -> inserting authenticate function inside thi app.get function

router.get('/about', authenticate, (req, res) => {
    console.log('profile page called');
    // console.log(req.rootUser)
    const name = req.rootUser.name;
    const email = req.rootUser.email;
    const phone = req.rootUser.phone;
    const profile = req.rootUser.profile;
    // req.rootUser -> Sending Currently logged in person profile 
    // res.send(req.rootUser);
    const userData = { name, email, phone, profile }
    res.send(userData);
});



// FOR GET USERDATA

router.get('/getdata', authenticate, (req, res) => {
    console.log(`about us page`);
    // req.rootUser -> Sending Currently logged in person profile 
    res.send(req.rootUser);
});

//Upload Profile Picture

router.put('/upload/profile', authenticate, async (req, res) => {
    
    

    try{
        const newProfile = {
            profile: req.body.body.imageUrl
        }
        const user = await User.findByIdAndUpdate(req.userID, newProfile, {
            new: true,
            runValidators: true,
            userFindAndModify: false,
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log(`Profile picture Upload error : ${error}`);
        res.status(400).json({ error: "Profile picture Upload error" });
    }
})

//delete profile picture
router.put('/delete/profile', authenticate, async (req, res) => {
    
    

    try{
        const newProfile = {
            profile: req.body.body.imageUrl
        }
        const user = await User.findByIdAndUpdate(req.userID, newProfile, {
            new: true,
            runValidators: true,
            userFindAndModify: false,
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log(`Profile picture deletion error : ${error}`);
        res.status(400).json({ error: "Profile picture deletion error" });
    }
})

//UPDATE USER PROFILE

router.put('/me/update', authenticate, async (req, res) => {
        
    // req.rootUser -> Sending Currently logged in person profile 
    try {
        
        const newUserData = {
            
            name: req.body.body.name,
            email: req.body.body.email,
            phone: req.body.body.phone,

        }
        

        
        const user = await User.findByIdAndUpdate(req.userID, newUserData, {
            new: true,
            runValidators: true,
            userFindAndModify: false,
        });
        


        res.status(200).json({ success: true });




    } catch (error) {
        console.log(`Profile Update error : ${error}`);
        res.status(400).json({ error: "Profile Update Error" });
    }
});


//CHANGE PASSWORD ROUTE

router.put('/password/update', authenticate, async (req, res) => {
    console.log("password reset called");
    console.log(req.body);
    console.log(req.userID);
    // req.rootUser -> Sending Currently logged in person profile 
    try {

        const user = await User.findById(req.userID).select(+password);
        console.log("user")
        console.log(user);
        //   const isPasswordMatched = await bcrypt.compare(password, userLogin.password);
        // req.body.oldPassword

        const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);
        console.log(isPasswordMatched);
        if (!isPasswordMatched) {
            res.status(400).json({ error: "old password incorrect" });
        }


        if (req.body.newPassword !== req.body.confirmPassword) {
            res.status(400).json({ error: "Password does not matched" });
        }

        user.password = req.body.newPassword;

        await user.save();

        res.status(200).send(req.token);




    } catch (error) {
        console.log(`Password reset error : ${error}`);
    }
});


// CONTACT US PAGE 
router.post('/contact', authenticate, async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // console.log(req.body);
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            console.log("Error in contact form at server side");
            return res.json({ error: "All Feilds must be filled" });
        }


        const userContact = await User.findOne({ _id: req.userID });

        if (userContact) {

            const userMessage = await userContact.addMessage(name, email, subject, message);

            await userContact.save();

            res.status(201).json({ message: "User Contact Form Saved Successfully" });
        }

    } catch (error) {
        console.log(`auth file error : ${error}`);
    }

});



// FEEDBACK PAGE

router.post('/feedback', authenticate, async (req, res) => {
    
    const { name, email, subject, message } = req.body.body;
    if (!name || !email || !subject || !message) {
        console.log("Error in Feedback form at server side");
        return res.status(400).json({ error: "All Feilds must be filled" });
    }


    // if (!name || !email || !phone || !password || !cpassword) {
    //     return res.status(400).json({ error: "Fill all Require Feild Properly " });
    // }

    // if (password.length < 8) {
    //     return res.status(400).json({ error: "password should be minimum 8 characters" });
    // }
    // if (!emailRegex.test(email)) {
    //     return res.status(400).json({ error: "Incorrect Email format" });
    // }
    // try {

    //     const userExist = await User.findOne({ email: email });

    //     if (userExist) {
    //         return res.status(400).json({ error: "Email already exist" });
    //     }
    //     else if (password != cpassword) {
    //         return res.status(400).json({ error: "password is not matching" })

    //     }
    //     else {

    //         if (!firebaseUID) {
    //             return res.status(400).json({ error: "firebaseUID cannot be null" });
                
    //         }
            

    //         const existingUserWithFirebaseUID = await User.findOne({ firebaseUID: firebaseUID });

    //         if (existingUserWithFirebaseUID) {
    //             return res.status(400).json({ error: "firebaseUID already exists" });
    //         }

    //         const user = new User({  name, email, phone, firebaseUID });
            

    //         // Hashing is Used


    //         await user.save().then((res)=> {
                
    //         });
            

    //         res.status(201).json({ message: " User register successfuly" });


    //     }



    // } catch (err) {

    //     console.log(err);
    // }


    try {
        

        const { name, email, subject, message } = req.body.body;
        
        const userContact = await User.findOne({ _id: req.userID });
        console.log('userData');
        

        if (userContact) {

            const userMessage = await userContact.addFeedback(name, email, subject, message);
            console.log(userMessage);
            await userContact.save();

            res.status(201).json({ message: "User FeedBack Form Saved Successfully" });
        }

    } catch (error) {
        console.log(`auth file error : ${error}`);
    }

});




// LOGOUT PAGE FUNCTIONALITY
// IN LOGOUT FUNCTIONALITY -> DELETE AVTIVE COOKIE -> USE LOOGED OUT

router.get('/logout', (req, res) => {

    console.log(`logout page from server`);
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send(`User Logout`);


});


module.exports = router;