#Pare Api

##Common Errors
https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format

Lambda functions must return in this specific format or will return a 502 gateway error every time

It will also return 502 if it times out, check logs carefully for timeouts it doesnt say its an error in cloud watch logs. This is probably a problem with the event loop specifically this context.callbackWaitsForEmptyEventLoop = false; line in every function
