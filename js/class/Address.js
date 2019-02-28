function NetworkID( networkID ) {
    this.network = networkID;
}

function Address( address ) {
    this.default_version = 0x01;
    var data_ba = base58_decode(address);
    if (data_ba.length != 25) {
        return new Error('parameters error!');
    }

    var prefix = data_ba.slice(0, 1);
    var code = data_ba.slice(-4);
    var digest = data_ba.slice(1, -4);
    var network = String.fromCharCode(prefix[0]);
    var number = code.join(''); //todo: hmmm...not sure

    var check_code = wordArrayToByteArray(CryptoJS.SHA256(CryptoJS.SHA256(byteArrayToWordArray(prefix.concat(digest))))).slice(0, 4);
    if (!check_code.equals(code)) {
        return new Error('parameters error!');
    }

    this.address = address;
    this.number = number;
    this.network = new NetworkID(network);

}

Address.generate = function (fingerprint = [], networkID = 0x08, version = 0x01) {
    if( version != 0x01 )
    {
        return null;
    }

    var network = String.fromCharCode(networkID);
    var network_wordarray = CryptoJS.enc.Latin1.parse(network);

    fingerprint = byteArrayToWordArray(fingerprint);
    var sha256 = CryptoJS.SHA256(fingerprint);
    var ripemd160 = CryptoJS.RIPEMD160(sha256);

    var concat_string = network_wordarray.concat(ripemd160);
    var concat_string_ba = wordArrayToByteArray(concat_string);
    var check_code = CryptoJS.SHA256( CryptoJS.SHA256(concat_string));
    var ba = wordArrayToByteArray(check_code);
    ba = ba.slice(0,4);
    var address_before_base58 = concat_string_ba.concat(ba);
    var address = base58_encode( address_before_base58);

    return new Address( address );
};
