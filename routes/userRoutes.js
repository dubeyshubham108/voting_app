const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// POST route to add a person   
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // using mongoose model create a new user
        const newUser = new User(data);

        // Save the new user to the data base
        const response =  await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);

        res.status(200).json({response: response, token: token});
    } catch (err) {
        console.log(err),
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route

router.post('/login', async (req, res) => {
    try {
        // Extract Aadhar card number and password
        const { aadharCardNumber, password } = req.body;

        // Find the user by username
        const user = await User.findOne({aadharCardNumber: aadharCardNumber})

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))) {
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate token
        const payload = {
            id: user.id,
        }
        const token  = generateToken(payload);

        // return token as a response
        res.json({token})

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findOne(userId); 
        res.status(200).json({user});
    } catch (err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // extract the id from the token
        const { currentPassword, newPassword } = req.body // extract the current password and new password

        // Find the user by userId
        const user = await User.findById(userId);

        // If password does not match
        if(!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // update user password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: "Password updated"});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;
