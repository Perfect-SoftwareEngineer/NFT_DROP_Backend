var express = require('express');
var jwt = require('jsonwebtoken');
var HttpStatusCodes = require('http-status-codes');

require("dotenv").config();


module.exports =function MiddlewareAuth(request, response, next) {
  const token = request.header('Authorization');
  if (!token) {
    return response.status(HttpStatusCodes.UNAUTHORIZED).send('UnAuthorized, no token');
  }
  // Verify token
  try {
    const user = jwt.verify(token, process.env.jwtSecret);
    request.wallet = user.wallet;
    next();
  } catch (error) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Invalid Token');
  }
}
