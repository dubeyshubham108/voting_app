const express = require('express');
const router = express.Router();
const User = require('../models/candidates');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidates');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

// POST route to add a person   
router.post('/signup', jwtAuthMiddleware, async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)) 
            return res.status(403).json({message: 'user has not admin role'});
        const data = req.body;

        // using mongoose model create a new user
        const newCandidate = new Candidate(data);

        // Save the new user to the data base
        const response =  await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});
    } catch (err) {
        console.log(err),
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)) 
            return res.status(403).json({message: 'user has not admin role'});

        const userId = req.user.id; // extract the id from the token
        const { currentPassword, newPassword } = req.body // extract the current password and new password

        const candidateID = req.params.candidateID; // Extract the ID from the URL
        const updatedCandidateData = req.body;

        const response = await User.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, //Return the updated document
            runValidators: true, //Run Mongoose validation
        })

        if(!response) {
            return res.status(403).json({ error: 'Candidate not found'});
        }
        console.log('Candidates data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)) 
            return res.status(403).json({message: 'user has not admin role'});

        const candidateID = req.params.candidateID; // Extract the ID from the URL
        const response = await User.findByIdAndDelete(candidateID);

        if(!response) {
            return res.status(403).json({ error: 'Candidate not found'});
        }
        console.log('Candidates data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;
