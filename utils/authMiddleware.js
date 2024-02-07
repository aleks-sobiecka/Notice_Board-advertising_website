const authMiddleware = (req, res, next) => {
    if (req.session.login) {
        next();
    } else {
        req.status(401).send({ message: 'You are not authorized'});
    }
}

module.exports = authMiddleware;