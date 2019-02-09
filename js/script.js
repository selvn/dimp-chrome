document.addEventListener('DOMContentLoaded', function() {
    console.log('here');
    console.log(document.getElementById('app'));
    // Still cannot use alert() but you can manipulate your window in other ways.
    var data = {
        logged: false, //登陆状态
        server_message:''
    };

    $('#login_button').on('click', login);

});

function append_messages(new_message) {
    var $textarea = $('#system_messages');
    $textarea.val($textarea.val()+'\n'+new_message);
    $textarea.scrollTop($textarea[0].scrollHeight);
}

function login() {
    generate_fingerprint();
    generate_address();
    chrome.sockets.tcp.create({bufferSize:4096}, function(createInfo) {
        console.log(createInfo);
        var server_address = $('#server_address').val().split(':');
        append_messages('connecting to '+ server_address.join(':'));
        chrome.sockets.tcp.connect(createInfo.socketId,
            server_address[0],parseInt( server_address[1]), function (response) {
                append_messages(server_address[0]+':'+server_address[1]+' connected: '+response);
                say_hello = {
                    'sender'   : users[use_user]['id']['name']+'@'+users[use_user]['id']['address'],
                    'receiver' : sv_server_ID['name'] + '@' + sv_server_ID['address'],
                    'time'     : math.floor(time.time()),
                    'meta'     : users[use_user]['meta'],
                    'content' : {
                        'type'    : 0x88, // DIMMessageType_Command
                        'sn'      : 1234,
                        'command' : "handshake",
                        'message' : "Hello world!"
                    }
                };
                var buffer = str2ab('helloworld!');
                chrome.sockets.tcp.send(createInfo.socketId, buffer, function () {
                    console.log('sent.');
                });
            });
    });
}

function generate_fingerprint() {
    // Sign with the private key...
    var sign = new JSEncrypt();
    sign.setPrivateKey($('#private_key').val());
    var signature = sign.sign($('#user_seed').val(), CryptoJS.SHA256, "sha256");
    $('#user_fingerprint').val(signature);
}
function generate_address() {
    var fingerprint = $('#user_fingerprint').val();
    // PROCESS
    var encryptedWord = CryptoJS.enc.Base64.parse(fingerprint); // encryptedWord via Base64.parse()
    // var decrypted = CryptoJS.enc.Utf8.stringify(encryptedWord); // decrypted encryptedWord via Utf8.stringify() '75322541'
// console.log(decrypted);

    var sha256 = CryptoJS.SHA256(fingerprint).toString();
    append_messages('sha256:'+sha256);
    var ripemd160 = CryptoJS.RIPEMD160(sha256).toString();

    append_messages('ripemd160:'+ripemd160);
    var network = String.fromCharCode(8);
    var check_code = CryptoJS.SHA256( CryptoJS.SHA256(network+ripemd160).toString()).toString();
    append_messages('check_code: '+check_code);
    check_code = check_code.substr(0,4);
    var address_before_base58 = network + ripemd160 + check_code;
    append_messages('address before base58: '+address_before_base58);
    let address = encode( stringToBytes(address_before_base58));
    append_messages('address: ' + address);
    // append_messages('asdfg123456: ' + encode(stringToBytes('asdfg123456')));

}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


