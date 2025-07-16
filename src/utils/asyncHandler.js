
//Way-2
const asyncHandler= (requestHandler)=>{
    return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).
        catch((err)=>next(err))
    }
}

export {asyncHandler}


/* just for understanding 
const asyncHandler= ()=>{}
const asyncHandler= (func)=>{()=>{}}
const asyncHandler= (func)=>async()=>{}
    */
/*Way-1
const asyncHandler=(fn)=>async (req, res, next)=>{
    try {
        await(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
    */
/**
 * asyncHandler - Utility to handle async route/controller functions
 *
 * This higher-order function wraps an asynchronous Express route handler
 * and automatically catches any errors, passing them to the next()
 * middleware (usually your global error handler).
 *
 * This helps avoid writing repetitive try-catch blocks in every async route.
 *
 * ✅ Usage with asyncHandler:
 * app.get("/route", asyncHandler(async (req, res, next) => {
 *     const data = await someAsyncOperation()
 *     res.json(data)
 * }))
 *
 * ❌ Without asyncHandler, you'd need to manually write try-catch in every route:
 * app.get("/route", async (req, res, next) => {
 *     try {
 *         const data = await someAsyncOperation()
 *         res.json(data)
 *     } catch (error) {
 *         next(error) // Pass error to Express error-handling middleware
 *     }
 * })
 *
 * If an error occurs inside the async function, asyncHandler catches it
 * and forwards it to Express's global error handler using next(err).
 */
