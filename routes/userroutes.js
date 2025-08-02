const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//post route of person
router.post("/signup", async (req, res) => {
	try {
		const data = req.body;
		const newUser = new User(data);

		// Save the new person to the database using await
		const response = await newUser.save(); //savedPerson = response

		console.log("Saved user to database");

		const payload = {
			id: response.id	
		};
		//const token = generateToken(response.username);
		console.log(JSON.stringify(payload));
		const token = generateToken(payload);
		console.log("token is:", token);
		res.status(201).json({ response: response, token: token });
	} catch (error) {
		console.log("Error saving person:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { aadharCardNumber, password } = req.body;

		const user = await User.findOne({ aadharCardNumber });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ error: "Invalid username or password" });
		}

		console.log("User authenticated:", user.aadharCardNumber);

		const payload = {
			id: user._id,
			
		};
		const token = generateToken(payload);

		console.log("Generated token:", token);

		res.json({ token });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        //console.log("User Data: ", userData);
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//update data
router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
	try {
		const userId = req.user; 
		const {currentPassword,newPassword} =req.body

	   const user = await User.findById(userId);

if (!(await user.comparePassword(currentPassword))) {
			return res.status(401).json({ error: "Invalid username or password" });
		}
      //update the new password
      user.password = newPassword;
       await user.save(); 

		console.log("password updated");
		res.status(200).json({message:"password updated"});
	} catch (error) {
		console.log("Error updating user:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});



module.exports = router;
