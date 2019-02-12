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
    console.log(encryptedWord);

    var sha256 = CryptoJS.SHA256(encryptedWord);
    console.log(sha256);
    append_messages('sha256:'+sha256);
    var ripemd160 = CryptoJS.RIPEMD160(sha256);
    console.log(ripemd160);

    append_messages('ripemd160:'+ripemd160);
    var network = String.fromCharCode(8);
    var network_wordarray = CryptoJS.enc.Utf8.parse(network);
    console.log(network_wordarray);
    var concat_string = network_wordarray.concat(ripemd160);
    console.log(concat_string);
    var check_code = CryptoJS.SHA256( CryptoJS.SHA256(concat_string));
    console.log(check_code.toString());
    var ba = wordArrayToByteArray(check_code);
    console.log(ba);
    append_messages('ba: '+ba);
    var address_before_base58 = network_wordarray.concat(ripemd160);
    for( var i = 0; i<4; i ++)
    {
        var tmp = String.fromCharCode(ba[i]);
        var tmp_wordarray = CryptoJS.enc.Utf8.parse(tmp);
        address_before_base58.concat(tmp_wordarray);
    }
    address_before_base58 = network_wordarray.concat(ripemd160).toString();
    console.log(address_before_base58);
    append_messages('address before base58: '+address_before_base58);
    var address = encode( stringToBytes(address_before_base58));
    console.log(address);
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



function byteArrayToWordArray(ba) {
    var wa = [],
        i;
    for (i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i);
    }

    return CryptoJS.lib.WordArray.create(wa, ba.length);
}

function wordToByteArray(word, length) {
    var ba = [],
        i,
        xFF = 0xFF;
    if (length > 0)
        ba.push(word >>> 24);
    if (length > 1)
        ba.push((word >>> 16) & xFF);
    if (length > 2)
        ba.push((word >>> 8) & xFF);
    if (length > 3)
        ba.push(word & xFF);

    return ba;
}

function wordArrayToByteArray(wordArray, length) {
    if (wordArray.hasOwnProperty("sigBytes") && wordArray.hasOwnProperty("words")) {
        length = wordArray.sigBytes;
        wordArray = wordArray.words;
    }

    var result = [],
        bytes
    i = 0;
    while (length > 0) {
        bytes = wordToByteArray(wordArray[i], Math.min(4, length));
        length -= bytes.length;
        result.push(bytes);
        i++;
    }
    return [].concat.apply([], result);
}