const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const Candidate = require("../models/Candidate");

const checkAdminRole = async (userId) => {
	try {
		const user = await User.findById(userId);
		if(user.role === 'admin'){
           return true;
        }
	} catch (err) {
		return false;
	}
};
///to add  a candidate
router.post("/",jwtAuthMiddleware, async (req, res) => {
	try {
		if (!(await checkAdminRole(req.user.id)))
			return res.status(403).json({ message: "user does not have admin role" });
		const data = req.body;
		const newcandidate = new Candidate(data);

		// Save the new person to the database using await
		const response = await newcandidate.save(); //savedPerson = response
		console.log("Saved candidate");
		res.status(201).json({ response: response });
	} catch (error) {
		console.log("Error saving candidate:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

//update data
router.put("/:candidateId",jwtAuthMiddleware, async (req, res) => {
	try {
		if (!checkAdminRole(req.user.id))
			return res.status(403).json({ message: "user has not admin role" });
		const candidateId = req.params.candidateId;
		const updatedCandidateData = req.body;

		const response = await Candidate.findByIdAndUpdate(
			candidateId,
			updatedCandidateData,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!response) {
			return res.status(404).json({ error: "candidate not found" });
		}
		console.log("candidate updated");
		res.status(200).json(response);
	} catch (error) {
		console.log("Error updating candidate:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});
//delete data
router.delete("/:candidateId",jwtAuthMiddleware, async (req, res) => {
	try {
		if (!checkAdminRole(req.user.id))
			return res.status(403).json({ message: "user has not admin role till" });
		const candidateId = req.params.candidateId;

		const response = await Candidate.findByIdAndDelete(
			candidateId
			
		);

		if (!response) {
			return res.status(404).json({ error: "candidate not found" });
		}
		console.log("candidate deleted");
		res.status(200).json(response);
	} catch (error) {
		console.log("Error delete candidate:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name voteCount'); // Only fetch needed fields

        const result = candidates.map(candidate => ({
            name: candidate.name,
            voteCount: candidate.voteCount
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get vote counts' });
    }
});

// Voting route
router.get('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admins are not allowed to vote' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Mark user as voted
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
