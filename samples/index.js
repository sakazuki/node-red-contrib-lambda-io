'use strict'
const RED = require('node-red');

const settings = {
    disableEditor: true,
    httpRoot: false,
    httpAdminRoot: false,
    httpNodeRoot: false,
    functionGlobalContext: { },
    awsRegion: process.env.AWS_REGION,
    awsS3Bucket: process.env.S3_BUCKET,
    awsS3Appname: process.env.AWS_LAMBDA_FUNCTION_NAME,
    storageModule: require('node-red-contrib-storage-s3'),
    credentialSecret: process.env.NODE_RED_SECRET || "a-secret-key"
};

let init = (() => {
  RED.init(settings);
  return new Promise((resolve, reject) => {
    let deployed;
    RED.events.on("runtime-event", deployed = function(data){
      if (data.id === "runtime-deploy") {
        RED.events.removeListener("runtime-event", deployed);
        resolve();
      }
    });
    RED.start();
  })
})();

exports.handler = (event, context, callback) => {
  init.then(() => {
    let handlers = {};
    function clearHandlers(){
      for(var key in handlers) RED.events.removeListener(key, handlers[key]);
    }
    function setHandlers(){
      for(var key in handlers) RED.events.once(key, handlers[key]);
    }
    handlers['aws:lambda:done:' + context.awsRequestId] = function(msg){ clearHandlers(); callback(null, msg) };
    handlers['aws:lambda:error'] = function(msg){ clearHandlers(); callback(msg) };
    setHandlers();
    RED.events.emit('aws:lambda:invoke', event, context);
  })
}
