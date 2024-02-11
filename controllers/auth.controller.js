const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const getImageFileType = require('../utils/getImageFileType');
const fs = require('fs');
const Session = require('../models/session.model');
const sanitize = require('mongo-sanitize');

exports.register = async (req, res) => {
    try {
        const {login, password, phoneNumber } = sanitize(req.body);
        const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

        if (login && typeof login === 'string' && 
            password && typeof password === 'string' && 
            phoneNumber && !isNaN(phoneNumber) && 
            req.file && ['image/png', 'image/jpeg', 'image/gif'].includes(fileType)) {

            const userWithLogin = await User.findOne({ login });
            if (userWithLogin) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(409).send({ message: 'User with this login already exists'});
            }

            //validation
            const loginPattern = new RegExp(/([A-Za-z\d]*)/, 'g')
            const loginMatched = login.match(loginPattern).join('');

            const passwordPattern = new RegExp(/([A-Za-z\d.,;:"'/?!@#$%^&*()--+=]*)/, 'g')
            const passwordMatched = password.match(passwordPattern).join('');

            if (loginMatched.length < login.length || passwordMatched.length < password.length) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: 'Invalid login or password' });
            }

            function isStrongPassword(password) {
                // Check length of password
                if (password.length < 6) {
                    return false;
                }
                // Check if password contains at least one uppercase letter
                if (!/[A-Z]/.test(password)) {
                    return false;
                }
                // Check if password contains at least one lowercase letter
                if (!/[a-z]/.test(password)) {
                    return false;
                }
                // Check if password contains at least one number
                if (!/\d/.test(password)) {
                    return false;
                }
                // The password meets all requirements
                return true;
            }

            if (isStrongPassword(password)) {
                console.log("Strong password!");
            } else {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).send({ message: 'Your password is too weak' })
            }

            //create new user
            const user = await User.create({ 
                login, 
                password: await bcrypt.hash(password, 10), 
                avatar: req.file.filename, 
                phoneNumber: Number(phoneNumber) 
            });
            
            res.status(201).send({ message: 'User created ' + user.login });
        } else {
            const path = req.file ? req.file.path : null;
            fs.unlinkSync(path);
            res.status(400).send({ message: 'Bad request' });
        }

    } catch (err) {
        const path = req.file ? req.file.path : null;
        fs.unlinkSync(path);
        res.status(500).send({ message: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const {login, password } = sanitize(req.body);

        if (login && typeof login === 'string' && password && typeof password === 'string') {

            //validation
            const loginPattern = new RegExp(/([A-Za-z\d]*)/, 'g')
            const loginMatched = login.match(loginPattern).join('');

            const passwordPattern = new RegExp(/([A-Za-z\d.,;:"'/?!@#$%^&*()--+=]*)/, 'g')
            const passwordMatched = password.match(passwordPattern).join('');

            if (loginMatched.length < login.length || passwordMatched.length < password.length) {

                return res.status(400).json({ message: 'Invalid login or password' });
            }

            const user = await User.findOne({ login });

            if (!user) {
                res.status(400).send({ message: 'Login or password are incorrect'});
            } else {
                if (bcrypt.compareSync(password, user.password)) {

                    const userObject = {
                        id: user.id,
                        login: user.login,
                      };
                    
                    req.session.user = userObject;
                    console.log(userObject);

                    res.status(200).send( { message: 'Login successful' });
                } else {
                    res.status(400).send({ message: 'Login or password are incorrect'});
                }
            }
        } else {
            res.status(400).send({ message: 'Bad request'});
        }

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.getUser = async (req, res) => {
    res.send({ message: "Yeah I'm logged" });
}

exports.logout = async (req, res) => {
    try {
        req.session.destroy();

        if (process.env.NODE_ENV !== "production") {
            await Session.deleteMany({});
        }

        res.status(200).send( { message: 'You have successfully logged out' });

    } catch (err) {
        res.status(400).send({ message: 'Bad request' });
        //console.log(err);
    }
}