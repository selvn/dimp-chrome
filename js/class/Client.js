function Client() {
    this.user = null;
    this.socket_id = null;
    this.running = false;

    this.session_key = null;
    this.handshake = false;

    this.set_server = function () {

    };
    this.switch_user = function (user) {
        this.user = user;
    };

    // create connection and get connected
    this.create_tcp_connection = function (host, port, callback) {
        this.host = host;
        this.port = port;

        var this_client = this;
        if (this.socket_id == null)
        {

            chrome.sockets.tcp.create({}, function(createInfo) {
                console.log(createInfo);
                chrome.sockets.tcp.onReceive.addListener(this_client.onReceive);
                console.log(123);
                this_client.socket_id = createInfo.socketId;
                chrome.sockets.tcp.setKeepAlive( this_client.socket_id, true,0, function (keep_alive_info) {
                    console.log(keep_alive_info);
                    callback.apply(this_client);
                } );


            });
        }
        else
        {
            chrome.sockets.tcp.getInfo(this.socket_id, function (socketInfo) {
                console.log(socketInfo);
            });
            callback.apply(this_client);
        }
    };

    this.login = function () {
        var message = client.get_login_message();
        this.send_message(message);
    };

    this.get_login_message = function () {
        var server_public_key = "-----BEGIN PUBLIC KEY-----\n" +
            "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrNbY6/SkGW/NhF1BZIZIQawqP\n" +
            "X19ucCMQP8jq5C5PAk6593Nm3AIm9OLKTAaW8THy/8Zgnel0vFQAfDpuxHg9tp5x\n" +
            "3kk1VZwr9hl173NvMT0fHBHatLFfnl5D6s+5yRfWJiUA4L35E2Z774Rg/vj3GlCb\n" +
            "/mqPsQ+ZMdMx19FdhwIDAQAB\n" +
            "-----END PUBLIC KEY-----\n";
        var receiver_account = new Account( 'sv_station@4WBVGYQCurdFyhAgp3Jzn28d9JEmYL9Kpp', server_public_key.replaceAll('\n','') );
        var json_content = {
            "type"    : 0x88, // DIMMessageType_Command
            "sn"      : 1234,
            "command" : "handshake",
            "message" : "Hello world!"
        };
        var message = new Message( json_content, this.user, receiver_account );

        return message;
    };

    this.onReceive = function (info) {
        console.log("Data received:");
        console.log(ab2str(info));
        if (info.socketId != this.socket_id)
        {
            return;
        }

        // info.data is an arrayBuffer.
    };

    this.send_message = function ( message ) {
        var this_client = this;
        console.log(JSON.stringify(message.json_data));
        var buffer = str2ab(JSON.stringify(message.json_data));
        chrome.sockets.tcp.getInfo(this.socket_id, function (socketInfo) {
            if( socketInfo.connected == true)
            // if( false == true)
            {
                chrome.sockets.tcp.send(this_client.socket_id, buffer, function () {
                    console.log('sent.....');
                });
            }
            else
            {
                console.log('not connected. Now connect and send.');
                chrome.sockets.tcp.connect(this_client.socket_id, this_client.host,this_client.port, function (response) {
                    chrome.sockets.tcp.setPaused(this_client.socket_id, false, function () {
                        chrome.sockets.tcp.send(this_client.socket_id, buffer, function () {
                            console.log('sent.');
                        });
                    });
                });
            }
        });
    };

}
