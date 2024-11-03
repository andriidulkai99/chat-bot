const auth = (req,res,next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || null

        if(token) {
            req['authorization'] = token;
        } else {
            return res.status(401).send({
                status: 'failed',
                message: 'Unauthorized'
            })
        }
        next()
    } catch (e) {
        res.status(401).send({
            status: 'failed',
            message: 'Unauthorized'
        })
    }
}

module.exports = {
    auth
};