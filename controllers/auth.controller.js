const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const {login, password } = req.body;

        if (login && typeof login === 'string' && password && typeof password === 'string') {
            const userWithLogin = await User.findOne({ login });

            if (userWithLogin) {
                return res.status(409).send({ message: 'User with this login already exists'});
            }

            const user = await User.create({ login, password: await bcrypt.hash(password, 10) });
            res.status(201).send({ message: 'User created ' + user.login });
        } else {
            res.status(400).send({ message: 'Bad request' });
        }

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const {login, password } = req.body;

        if (login && typeof login === 'string' && password && typeof password === 'string') {
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
    }
}