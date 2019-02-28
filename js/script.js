var user = null;
var client = new Client();
document.addEventListener('DOMContentLoaded', function() {
    console.log('here');
    // Still cannot use alert() but you can manipulate your window in other ways.
    var data = {
        logged: false, //登陆状态
        server_message:''
    };

    $('#login_button').on('click', login);

    client = new Client();

    var address = new Address('4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk');
});

function append_messages(new_message) {
    var $textarea = $('#system_messages');
    $textarea.val($textarea.val()+'\n'+new_message);
    $textarea.scrollTop($textarea[0].scrollHeight);
}

function login() {
    var meta = new Meta($('#user_seed').val(), $('#private_key').val(), $('#public_key').val() );
    var address = Address.generate(meta.fingerprint, 0x08);
    var id_string = $('#user_seed').val().replaceAll('\n','') + '@' + address.address;
    var id = new ID(id_string);
    user = new User(id.name + '@' + id.address, $('#private_key').val(), meta );
    client.switch_user( user);
    var server_address = $('#server_address').val().split(':');

    client.create_tcp_connection(server_address[0],parseInt( server_address[1]), client.login);
}



function generate_fingerprint() {
    // Sign with the private key...
    var sign = new JSEncrypt();
    sign.setPrivateKey($('#private_key').val());
    var signature = sign.sign($('#user_seed').val(), CryptoJS.SHA256, "sha256");
    $('#user_fingerprint').val(signature);


    console.log(meta.fingerprint);
}
function generate_address() {
    var fingerprint = $('#user_fingerprint').val();
    var encryptedWord = CryptoJS.enc.Base64.parse(fingerprint); // encryptedWord via Base64.parse()
    var address = Address.generate( wordArrayToByteArray(encryptedWord), 0x08);
    $('#user_address').val(address.address);
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
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
        bytes,
        i = 0;
    while (length > 0) {
        bytes = wordToByteArray(wordArray[i], Math.min(4, length));
        length -= bytes.length;
        result.push(bytes);
        i++;
    }
    return [].concat.apply([], result);
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};


function generate_random_string( length ) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};