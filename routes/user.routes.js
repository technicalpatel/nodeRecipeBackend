// All External Packages
const express = require('express');
const router = express.Router();

const usermiddleware = require('../middleware/usermiddleware');
const commonMiddleware = require('../shared/middleware/commonMiddleware');

// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('../swagger.json');

const fileUpload = require('express-fileupload');
const timeout = require('connect-timeout');


router.use(fileUpload());
// Login API (OK)
router.post('/login', commonMiddleware.bodyCheck, usermiddleware.userCheckLogin);

// Register USER API (OK)
router.post('/register',timeout('5s'), commonMiddleware.bodyCheck, usermiddleware.validationCheck, usermiddleware.registerCheck);

// Login Forget API AND OTP TOKEN GENRATE (OK)
router.post('/login/forget', commonMiddleware.bodyCheck, usermiddleware.emailCheck, usermiddleware.otpTokenGenerator);

// Foget Password OTP Token Check API AND ChangePassword API (OK)
router.post('/forget/token/check', commonMiddleware.bodyCheck, usermiddleware.emailCheck, usermiddleware.userNewPasswordCheckValidation, usermiddleware.otpTokenCompare);

// UserChangePassword Change (OK)
router.post('/userchangepassword', commonMiddleware.bodyCheck, commonMiddleware.verifyAuthTokenAndEmail, usermiddleware.userNewPasswordCheckValidation, usermiddleware.userCheckChangePassword);

// User Profile Get Profile (OK)
router.post('/profile', commonMiddleware.bodyCheck, commonMiddleware.verifyAuthToken, commonMiddleware.verifyAuthTokenAndEmail, usermiddleware.profileGet);

// Profile Updated API (OK)
router.post('/profile/updated', commonMiddleware.verifyAuthToken, commonMiddleware.bodyCheck, commonMiddleware.verifyAuthTokenAndEmail, usermiddleware.profileUpdated);


// router.use('/api-docs', swaggerUi.serve);
// router.get('/api-docs', swaggerUi.setup(swaggerDocument));

router.use((error, req, res, next) => {
    if (error) {
        res.status(500).send(data = { status: "ERROR", message: error.message });
    }
});

module.exports = router;