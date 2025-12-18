const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user est rempli par le middleware 'protect' juste avant
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error', 
                message: "Vous n'avez pas les permissions pour cette action." 
            });
        }
        next();
    };
};

module.exports = { restrictTo };