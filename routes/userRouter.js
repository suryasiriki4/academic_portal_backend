const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { findOne } = require("../models/userModel");
const jwt = require('jsonwebtoken');
const auth = require("../middleware/auth");
const User = require("../models/userModel");


// router.get("/test", (req, res) => {
//     res.send("Hello, it's working");
// });

router.post("/register", async (req, res) => {
    try{
        let {email, password, passwordCheck, displayName} = req.body;

        //validation
        if(!email || !password || !passwordCheck) {
            return res.status(400).json({msg: "not all fields are entered"});
        } else if (password.length < 5) {
            return res
            .status(400)
            .json({msg: "password < 5 chars"});
        } else if (passwordCheck !== password) {
            return res
            .status(400)
            .json({msg: "password not match with passwordchecker"})
        }

        const existingUser = await User.findOne({email: email});

        if(existingUser) {
            return res
            .status(400)
            .json({msg: "account already exists"});
        }

        if(!displayName) {
            displayName = email;
        }

        //hashing the password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: passwordHash,
            displayName
        });
        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({error: err.message});
    }
    
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        //validate

        if(!email || !password) {
            return res.status(400).json({ msg: "not all fields are filled"});
        }

        const user = await User.findOne({email: email});
        if(!user) {
            return res
            .status(400)
            .json({msg: "account doensn't exit"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
            .status(400)
            .json({msg: "incorrect password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRETS);
        res.json({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
            }
        })
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.delete("/delete", auth, async (req, res) => {

    try {
        const deleteUser = await User.findByIdAndDelete(req.user);
        res.json(deleteUser);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
    console.log(req.user);
});

router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        
        if(!token) {
            return res.json(false);    
        }

        const verified = jwt.verify(token, process.env.JWT_SECRETS);
        if(!verified) {
            return res.json(false);
        }
        const user = await User.findById(verified.id);
        if(!user) {
            return res.json(false);
        }

        return res.json(true);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
        displayName: user.displayName,
        id: user._id,
    });
});


module.exports = router;