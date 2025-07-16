
class ApiError extends Error{
    //constructor(){}
    constructor(
        statusCode,
        message="Something went wrong",
        error=[],
        stack=""
    ){
        super(message),
        this.statusCode=statusCode
        this.data= null, // this file is for api error....not for api response
        this.message=message,
        this.success=false,
        this.error=error

        //this if else block is not necessary..but used in production
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}
export {ApiError}

/**
 * ApiError - Custom error class for handling API errors in a consistent format.
 *
 * Extends the built-in JavaScript Error class to include additional
 * information like statusCode, error details, and success flag.
 *
 * ✅ Purpose:
 * - Send consistent, structured error responses from your API.
 * - Attach useful information such as HTTP status code and additional error details.
 * - Customize stack trace handling for debugging in development/production.
 *
 * ✅ Usage:
 * throw new ApiError(404, "User not found", ["No user exists with that ID"])
 *
 * The above will create an error object like:
 * {
 *   statusCode: 404,
 *   message: "User not found",
 *   success: false,
 *   data: null,
 *   error: ["No user exists with that ID"],
 *   stack: ... // (included automatically unless custom stack is passed)
 * }
 *
 * ❌ Without ApiError:
 * You would typically throw a generic error like:
 *     throw new Error("User not found")
 * And then manually set statusCode, success, and error fields in your error handler.
 * This makes the code repetitive and less maintainable.
 *
 * ✅ Recommended: Use ApiError with a global error-handling middleware like:
 * app.use((err, req, res, next) => {
 *     const statusCode = err.statusCode || 500;
 *     res.status(statusCode).json({
 *         success: err.success || false,
 *         message: err.message || "Internal Server Error",
 *         error: err.error || [],
 *         data: err.data || null,
 *     });
 * });
 */