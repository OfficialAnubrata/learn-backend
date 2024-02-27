const  asyncHandeler = (requestHandeler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandeler(req,res,next)).catch((error) => next(error))
    }
}



export { asyncHandeler }