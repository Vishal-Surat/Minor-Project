// backend/src/utils/apiResponse.js
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  export const sendError = (res, error, message = 'Something went wrong', statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
    });
  };
  