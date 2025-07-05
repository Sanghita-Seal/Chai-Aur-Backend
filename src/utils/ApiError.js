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
        this.errors=errors

        //this if else block is not necessary..but used in production
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}
export {ApiError}