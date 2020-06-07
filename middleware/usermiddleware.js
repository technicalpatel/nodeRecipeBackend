const commonFunction = require('../shared/commonFunction/commonFunction');
const userController = require('../controller/user.controller');
const emailExistence = require('email-existence');
const validator = require('email-validator');

usermiddleware = {};

// User Check IS User Valid Or Not Login API
usermiddleware.userCheckLogin = async function (req, res, next) {
    try {
        await userController.userCheckLogin(req.body, function (data) {
            if (data.status == "OK") {
                return res.status(200).send(data);
            }
            return res.status(400).send(data);
        });
    } catch (error) {
        error.message = "ERROR USER MIDDLEWARE"
    }
}

// Register User Check ALL Validation IS Full Filled
usermiddleware.validationCheck = async function (req, res, next) {
    try {
        await commonFunction.validationUser(req.body, function (data) {
            if (Object.keys(data).length == 0) {
                next();
            } else {
                return res.status(400).send({ status: "ERROR", ERROR: data });
            }
        });
    } catch (error) {
    }
}

// Register Check To Email ID And Phone Number Is Duplicate
usermiddleware.registerCheck = async function (req, res, next) {
    try {
        // await emailExistence.check(req.body.user_email.toLowerCase(), async function (error, response) {
            // if(response){
            if (validator.validate(req.body.user_email.toLowerCase())) {
                await userController.emailOrPhoneExists(req.body.user_email, req.body.user_phone, async function (data) {
                    if (Object.entries(data).length == 0) {
                        await userController.registerUser(req.body, function (data) {
                            return res.send(data);
                        });
                    } else {
                        return res.status(400).send({ status: "ERROR", ERROR: data });
                    }
                    // if (data.status == "OK") {
                    //     await userController.registerUser(req.body, function (data) {
                    //         res.send(data);
                    //     });
                    // } else {
                    //     res.status(400).send({ status: "ERROR", ERROR:data });
                    // }
                });
            } else {
                res.status(400).send({ status: "ERROR", ERROR: "Email is not valid" });
            }
        // });
    } catch (error) {
        error.message="Server register Error";
    }
}

// User Forget Password To Check Email Exists Or Not
usermiddleware.emailCheck = async function (req, res, next) {
    await commonFunction.emailValid(req.body.user_email, async function (data) {
        if (data.status == "ERROR") {
            return res.status(400).send(data);
        } else {
            await userController.emailExists(req.body.user_email, function (data) {
                if (data.status == "OK") {
                    next();
                } else {
                    return res.status(400).send(data);
                }
            });
        }
    });
}

// User NewPassword Validation Check
usermiddleware.userNewPasswordCheckValidation = async function (req, res, next) {
    try {
        await commonFunction.passwordValid(req.body.user_newpassword, function (data) {
            if (data.status == "OK") {
                next();
            } else {
                return res.status(400).send(data);
            }
        });
    } catch (error) {
        return res.status(500).send(data = { status: "ERROR", message: "MIDDLE PASSWORD CHANGE ERROR HENDLER" });
    }
}


// OTP TOKEN COMAPARE IS VALID OR NOT
usermiddleware.otpTokenCompare = async function (req, res, next) {
    try {
        if (Object.entries(req.body).length == 0) {
            return res.status(400).send({ status: "ERROR", message: "NOT ACCEPTED REQUEST ON SERVER" });
        } else {
            await userController.otpTokenCompare(req.body, async function (data) {
                if (data.status == "OK") {
                    try {
                        await userController.userForgetChangePassword(req, function (data) {
                            return res.status(200).send(data);
                        });
                    } catch (error) {
                    }
                } else {
                    return res.status(400).send(data);
                }
            });
        }
    } catch (error) {
    }
}

// OTP Token Generator
usermiddleware.otpTokenGenerator = async function (req, res, next) {
    try {
        await userController.otpTokenGenerator(req.body.user_email, function (data) {
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send(data = { status: "ERROR", message: "ROUTE ERROR" });
    }
}

// User Change Password
usermiddleware.userCheckChangePassword = async function (req, res, next) {
    try {
        await userController.userCheckChangePassword(req.body, req.headers, function (data) {
            if (data.status == "OK") {
                res.status(200).send(data);
            } else {
                res.status(400).send(data);
            }
        });
    } catch (error) {
    }
}

// User Profile Get Profile (OK)
usermiddleware.profileGet = async function (req, res, next) {
    try {
        await userController.profileGet(req.body.user_email, function (data) {
            res.send(data);
        });
    } catch (error) {
    }
}

// Profile Updated
usermiddleware.profileUpdated = async function (req, res, next) {
    try {
        if (!req.files) {
            return res.status(400).send(data = { status: "ERROR", message: "PLEASE SEND A IMAGE" });
        } else {
            await userController.profileUpdated(req.files.user_profile, req.body.user_email, req.files.user_profile.name, req.files.user_profile.size, function (data) {
                res.send(data);
            });
        }
    } catch (error) {
        res.send("CALLED ERROR");
    }
}

module.exports = usermiddleware;