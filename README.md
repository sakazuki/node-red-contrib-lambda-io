
# node-red-contrib-lambda-io

Node-RED nodes to make AWS Lambda Functions on lambda

# Breaking Changes
After v1.0.0,  event names used internal were changed

|Type|Before|After|
|----|----|----|
|success|aws:lambda:done:[id]|aws:lmbda:callback:[id]|
|error|aws:lambda:error|aws:lmbda:callback:[id]|

You have to use [aws-serverless-node-red](https://github.com/sakazuki/aws-serverless-node-red) v1.0.0 after

# Install

```
npm install node-red-contrib-lambda-io
```
# Usage

Provides 3 nodes. (input, output and test)

## Input

Lambda Function input node. Create and Send Message when a Lambda Function is invoked.

## Output

Lambda Function output node. Return Message to correponding a Lambda Function invocation.

## Test

Lambda Funciton input/ouput test node. Test above 2 nodes on Node-RED editor.

# How to create a Lambda Function

## Precondition
- Setup aws cli configuration
- Checkout this repogitory
    ```
    git clone https://github.com/sakazuki/node-red-contrib-lambda-io.git
    ```

- See [samples](https://github.com/sakazuki/node-red-contrib-lambda-io/blob/master/samples)

## In your local environment (PC or else)

- Create a lambda deploy package

  ```
  cd samples/
  npm install
  npm run zip ## create app.zip
  ```

- Create a Node-RED flow

  ```
  export S3_BUCKET=XXXXXX
  export AWS_LAMBDA_FUNCTION_NAME=YYYYYYY   ## this must be the same as the lambda function name on AWS.
  npm run dev
  ```

  access the URL http://localhost:1880 , and create and deploy a flow using the lambda nodes.  
  Flow files save in S3.


## Create a lambda Function

- Name must be the same as above **AWS_LAMBDA_FUNCTION_NAME**
- The environment variable **S3_BUCKET** must be set.
- This function must be attached with the role having S3 GetObject/PutObject.
- Upload **app.zip**

## Tips
- Timeout sec maybe should be over 30 sec. (At first time, it takes a long)

