module.exports = function(RED){
    function LambdaInNode(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        var node = this;
        var events = {};
        events['aws:lambda:invoke'] = function(event, context){
            if (!event._msgid) {
                event._msgid = RED.util.generateId();
            }
            node.send({payload: event, context: context});
        }
        for (var key in events){
            RED.events.on(key, events[key]);
        }
        node.on('close', function(){
            for (var key in events){
                RED.events.removeListener(key, events[key]);
            }
        })
    }
    RED.nodes.registerType('lambda in', LambdaInNode);

    function APIGatewayLambdaProxyOutputHelper(msg, options = null){
        // https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
        const response = {
            isBase64Encoded: msg.isBase64Encoded || false,
            statusCode: msg.statusCode || 200,
            headers: msg.hasOwnProperty("headers") ? msg.headers : {},
            body: ""
        }
        if (options) Object.assign(response, options);
        if (msg.hasOwnProperty("payload")) {
            if (typeof msg.payload === "string") {
                response.body = msg.payload;
            } else if (Buffer.isBuffer(msg.payload)) {
                response.body = msg.payload.toString('base64');
                response.isBase64Encoded = true;
            } else {
                response.body = JSON.stringify(msg.payload);
            }
        }
        return response;
    }

    function LambdaOutNode(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.lambda_proxy_helper = config.lambda_proxy_helper;
        var node = this;
        node.on('input', function(msg){
            if (msg.context || msg.error){
                var res;
                if (node.lambda_proxy_helper) {
                    res = APIGatewayLambdaProxyOutputHelper(msg)
                }else{
                    res = msg.payload;
                }
                RED.events.emit('aws:lambda:done:' + msg.context.awsRequestId, res)
            }else{
                RED.events.emit('aws:lambda:error', msg)
            }
        })
    }
    RED.nodes.registerType('lambda out', LambdaOutNode);

    function LambdaTestNode(config){
        RED.nodes.createNode(this, config);
        this.name = config.name;
        var node = this;
        var events = {};
        node.on('input', function(msg){
            events['aws:lambda:done:' + msg._msgid] = function(data) { node.send(data) };
            events['aws:lambda:error'] = function(data){ node.warn('error', data) };
            for (var key in events){
                RED.events.once(key, events[key])
            }
            RED.events.emit('aws:lambda:invoke', msg.payload, {awsRequestId: msg._msgid})
        })
        node.on('close', function(){
            for (var key in events){
                RED.events.removeListener(key, events[key]);
            }
        })
    }
    RED.nodes.registerType('lambda test', LambdaTestNode);

}
