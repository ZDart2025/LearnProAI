const jwt = require('jsonwebtoken');
const db_conn = require('../config/db');
const emailer = require('../middlewares/emailer');
const logger = require('../utils/logger');
const { otpStore } = require('../data/MapModules');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once

const GenerateOTP = async (req, res) => {
    const { email_id } = req.body;

    try {
        // Check if email is missing
        if (!email_id) {
            logger.loggerWarn(`${email_id} - Email ID is Empty !`);
            res.status(401).json({ error: true, message: 'Email ID is Empty. Please try again later !' });
        }

        let otp = await generateOTP();

        if (otp) {
            const sendEmail = await emailer.EmailConfig(email_id, mailHead = 'OTP', otp);
            if (sendEmail) {
                // Store OTP in memory with a timestamp
                otpStore.set(email_id, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 minutes
                logger.loggerSuccess(`Generated OTP for ${email_id}: ${otp}`);
                res.status(200).json({ error: false, message: `OTP is sent to ${email_id}` });
            } else {
                logger.loggerWarn(`Email is not to ${email_id}`);
                res.status(400).json({ error: true, message: `Email is not to ${email_id}` });
            }
        } else {
            logger.loggerWarn(`OTP is not generated for ${email_id}`);
            res.status(400).json({ error: true, message: 'OTP is not generated' });
        }

    } catch (error) {
        logger.loggerError(`GenerateOTP - ${error.message} for ${email_id}`);
        res.status(500).json({ error: true, message: error.message });
    }
};

const authOTP = async (req, res) => {
    const { email_id, otp } = req.body;

    try {

        if (!email_id || !otp) {
            res.status(401).json({ error: true, message: 'Email ID / OTP is missing. Please try again later !' });
        }

        if (otpStore.has(email_id)) {
            const storedOTP = otpStore.get(email_id);

            // Check OTP expiration
            if (storedOTP.expiresAt < Date.now()) {
                otpStore.delete(email_id);
                logger.loggerWarn(`${email_id} - OTP has expired`);
                return res.status(400).json({ error: true, message: 'OTP has expired' });
            }

            // Validate OTP (check if it's correct)
            if (storedOTP.otp === otp) {

                logger.loggerSuccess(`${email_id} - OTP validated successfully`);

                const saveDetails = await saveUserdetails(email_id);

                // Optionally, remove OTP from store after successful validation to prevent reuse
                otpStore.delete(email_id);

                if (saveDetails.error === false && saveDetails.message) {
                    const token = jwt.sign({ email_id }, JWT_SECRET);
                    res.status(200).json({ error: false, message: saveDetails.message, token, data: saveDetails.data });
                } else {
                    res.status(400).json({ error: true, message: saveDetails.message });
                }
            } else {
                // OTP is incorrect
                logger.loggerWarn(`Invalid OTP for ${email_id}`);
                res.status(400).json({ error: true, message: 'Invalid OTP' });
            }
        } else {
            logger.loggerError(`OTP is not available / expired for ${email_id}`);
            res.status(400).json({ error: true, message: 'OTP is not available, please try again later !' });
        }

    } catch (error) {
        logger.loggerError(`authOTP - ${error.message}`);
        res.status(500).json({ error: true, message: error.message });
    }
}

// Generate a random number between 100000 and 999999
async function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

async function saveUserdetails(email_id, name) {
    try {

        const usersCollection = db.collection('users');

        if (!email_id) return { error: true, message: 'Email ID is missing. Please try again later !' };

        const existingUser = await usersCollection.findOne({ email_id: email_id });

        if (existingUser && existingUser.status === true) {
            logger.loggerWarn(`${email_id} - Already Registered! and now logged in successfully `);
            return { error: false, message: 'Logged In successfully', data: { email_id, user_id: existingUser.user_id, username: existingUser.username } };
        } else if (existingUser && existingUser.status === false) {
            const updateResult = await usersCollection.updateOne(
                { user_id: existingUser.user_id },
                {
                    $set: {
                        status: true,
                        modified_by: email_id,
                        modified_date: new Date()
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                logger.loggerWarn(`${email_id} - Failed to Register, Please try again later !`);
                return { error: true, message: 'Failed to Register, Please try again later !' };
            }

            logger.loggerSuccess(`${email_id} - Registered successfully !`);
            return { error: false, message: `Registered successfully !`, data: { email_id, user_id: existingUser.user_id } };
        } else {
            // Use aggregation to fetch the highest user_id
            const lastUser = await usersCollection.find().sort({ user_id: -1 }).limit(1).toArray();
            let newUserId = 1; // Default user_id if no users exist
            if (lastUser.length > 0) {
                newUserId = lastUser[0].user_id + 1;
            }
            const insertResult = await usersCollection.insertOne({
                role_id: 5,
                reseller_id: null,
                client_id: null,
                association_id: null,
                user_id: newUserId,
                username: name || null,
                phone_no: null,
                email_id: email_id,
                assigned_association: null,
                created_by: email_id,
                created_date: new Date(),
                modified_by: null,
                modified_date: null,
                status: true
            });

            if (insertResult.acknowledged) {
                logger.loggerSuccess(`${email_id} - Registered successfully !`);
                return { error: false, message: `Registered successfully !`, data: { email_id, user_id: newUserId, username: name } };
            } else {
                logger.loggerSuccess(`${email_id} - Failed to Register, Please try again later !`);
                return { error: true, message: `Failed to Register, Please try again later !` };
            }
        }

    } catch (error) {
        logger.loggerError(`saveUserdetails - ${error.message} for ${email_id}`);
        return { error: true, message: error.message };
    }
}

const googleSignIN = async (req, res) => {
    const { idToken } = req.body;

    try {

        if (!idToken) return res.status(401).json({ error: true, message: 'Google id token is missing. Please try again later !' });

        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID, // Your client ID
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        if (!email || !name) return res.status(401).json({ error: true, message: "Can't able to get Email/Username from google. Please try again later !" });

        const saveDetails = await saveUserdetails(email, name);

        if (saveDetails.error === false && saveDetails.message) {
            const token = jwt.sign({ email }, JWT_SECRET);
            res.status(200).json({ error: false, message: saveDetails.message, token, data: saveDetails.data });
            logger.loggerSuccess(`${email} - Logged In successfully`);
        } else {
            res.status(400).json({ error: true, message: saveDetails.message });
            logger.loggerWarn(`${email} - Failed to Log In`);
        }

    } catch (error) {
        logger.loggerError(`googleSignIN - ${error.message} for for ${idToken}`);
        res.status(500).json({ error: true, message: error.message });
    }
}

module.exports = { GenerateOTP, authOTP, googleSignIN };