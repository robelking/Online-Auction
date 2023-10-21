const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const admin = require('firebase-admin');
const serviceAccount = require("../credentials.json");
// const { response } = require("express");

/*THIS FILE IS FOR AUTHENTICATION TOKE VERIFICATION -> AT ANI TIME USER ID MUSTR BE VERIFY WITH CURRENT TOKE  ID THEN ONLY WE CAN RETRAIN INFORMATION FROM CURRRENT USER ID*/
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const authenticate = async (req, res, next) => {

    try {

        // HERE WE GET CURRENT TOKEN FROM JWT TOKEN
        const idToken = req.headers.authorization.split('Bearer ')[1];
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userID = decodedToken.uid;
        
        // Find the user by their Firebase UID
        const rootUser = await User.findOne({ firebaseUID: userID });
        
        // For test
        if (!rootUser) { throw new Error('User Not Found') }

        // TO USE THAT CURRRENT USER INFORMATION INSIDE THE PROFILE PAGE WE ARE STORING IT 
        // ALL DATAV STORES IN req.rootUser
        req.token = idToken;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        
        
        // NEXT FUNCTION CALLED AFTER MIDDLEWARE
        next();


    } catch (err) {
        console.log(err)
        console.log(`error token verification`);
        res.status(401).send('Unauthorised: No token provided');
    }



}


module.exports = authenticate;