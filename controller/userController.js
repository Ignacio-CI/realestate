import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { generateId, generateJWT } from '../helpers/token.js'
import { emailRegister, emailForgotPassword } from '../helpers/email.js'

const loginForm = (req, res) => {
    res.render('auth/login', {
        page: 'Login',
        csrfToken: req.csrfToken(),
    });
};

const authenticate = async (req, res) => {
    // Validation
    await check('email').isEmail().withMessage('Enter a valid email adress').run(req);
    await check('password').notEmpty().withMessage('Enter a valid password').run(req);

    let result = validationResult(req);

    // Verify if results have errors
    if (!result.isEmpty()) {
        return res.render('auth/login', {
            page: 'Login',
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: {
                name: req.body.name,
                email: req.body.email,
            }
        })
    }

    const { email, password } = req.body;

    // Verify if the user exists
    const user = await User.findOne({ where: { email }});
    if(!user) {
        return res.render('auth/login', {
            page: 'Login',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'The user does not exist'}]
        })
    }

    // Verify is the user is confirmed
    if(!user.confirmed) {
        return res.render('auth/login', {
            page: 'Login',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'Your account has not been confirmed'}]
        })
    }

    // Check the password
    if(!user.verifyPassword(password)) {
        return res.render('auth/login', {
            page: 'Login',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'The password is incorrect'}]
        })
    }

    // Authenticate the user
    const token = generateJWT({ id: user.id, name: user.name });

    console.log(token)

    // Store token in a cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect('/my-properties');
};

const registerForm = (req, res) => {

    console.log(req.csrfToken());

    res.render('auth/register', {
        page: 'Create a new account',
        csrfToken: req.csrfToken(),
    });
}

const register = async (req, res) => {
    // Validation
    await check('name').notEmpty().withMessage('Name is empty').run(req);
    await check('email').isEmail().withMessage('Enter a valid email adress').run(req);
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters').run(req);
    //await check('confirm_password').equals('password').withMessage('The passwords must match').run(req);

    await check('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('The passwords must match');
        }
        return true;
    }).run(req);

    let result = validationResult(req);

    // Verify if results have errors
    if (!result.isEmpty()) {
        return res.render('auth/register', {
            page: 'Create a new account',
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: {
                name: req.body.name,
                email: req.body.email,
            }
        })
    }

    // This array contains posible errors if the user does not enter a name.
    //res.json(result.array());

    // Get user data from form
    const { name, email, password } = req.body;

    // Verify if email is not duplicated
    const userExists = await User.findOne( { where : { email} });
    // console.log(userExists);
    if (userExists) {
        return res.render('auth/register', {
            page: 'Create a new account',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'User already exists'}],
            user: {
                name: req.body.name,
                email: req.body.email,
            }
        })
    }
    
    // Store a new user
    const user = await User.create({
        name,
        email,
        password,
        token: generateId()
    })

    // Send confirmation email
    emailRegister({
        name: user.name,
        email: user.email,
        token: user.token
    })

    // Show confirmation message
    res.render('templates/message', {
        page: 'Account created successfully',
        message: 'We have sent you a confirmation email. Click the link below to confirm your account.'
    })
};

// Function that confirms an account
const confirm = async (req, res) => {
    const { token } = req.params;

    //verify if the token is valid
    const user = await User.findOne({ where : {token} });
    
    if(!user) {
        return res.render('auth/confirm-account', {
            page: 'Error trying to confirm account',
            message: 'There was an error trying to confirm your account. Please try again.',
            error: true,
        })
    }

    // Confirm account
    user.token = null;
    user.confirmed = true;
    await user.save();

    res.render('auth/confirm-account', {
        page: 'Account confirmed',
        message: 'Your account has been confirmed successfully!',
    })

    //console.log(user);

};

const forgotPasswordForm = (req, res) => {
    res.render('auth/forgot-password', {
        page: 'Reset password',
        csrfToken: req.csrfToken(),
    });
}

const resetPassword = async (req, res) => {
    // Validation
    await check('email').isEmail().withMessage('Enter a valid email adress').run(req);

    let result = validationResult(req);

    // Verify if results have errors
    if (!result.isEmpty()) {
        return res.render('auth/forgot-password', {
            page: 'Reset your password',
            csrfToken: req.csrfToken(),
            errors: result.array(),
        })
    }

    // Search for user
    const { email } = req.body;

    const user = await User.findOne({ where : {email}})
    //console.log(user);
    if(!user) {
        return res.render('auth/forgot-password', {
            page: 'Reset your password',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'User not registered'}],
        })
    }

    // Generate a new token 
    user.token = generateId();
    await user.save();

    // Send an email
    emailForgotPassword({
        email: email,
        name: user.name,
        token: user.token
    });

    // Render message
    res.render('templates/message', {
        page: 'Reset your password',
        message: 'We have sent you an email with the instruction to reset your password.'
    })
};

const verifyToken = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ where : {token}});

    if(!user) {
        return res.render('auth/confirm-account', {
            page: 'Reset your password',
            message: 'There was an error trying to validate your information. Please try again.',
            error: true,
        })
    }
    
    // Show reset password form
    res.render('auth/reset-password', {
        page: 'Reset your password',
        csrfToken: req.csrfToken()
    })
};

const newPassword = async (req, res) => {
    // Validate new password
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters').run(req);

    let result = validationResult(req);

    // Verify if results have errors
    if (!result.isEmpty()) {
        return res.render('auth/reset-password', {
            page: 'Reset your password',
            csrfToken: req.csrfToken(),
            errors: result.array(),
        })
    }

    const { token } = req.params;
    const { password } = req.body;

    // Identify who is making the change
    const user = await User.findOne({ where: {token}});
    console.log(user);

    // Hashing the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash( password, salt );
    // this avoid having living token in the URL
    user.token = null;

    await user.save();

    res.render('auth/confirm-account', {
        page: 'Password reset',
        message: 'Your new password has been saved successfully'        
    })
};

export {
    loginForm,
    authenticate,
    registerForm,
    register,
    confirm,
    forgotPasswordForm,
    resetPassword,
    verifyToken,
    newPassword,
}