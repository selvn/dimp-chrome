function Message( json_content, sender_user, receiver_account ) {
    json_data = {
        "sender"   : sender_user.ID_string,
        "receiver" : receiver_account.ID_string,
        "time"     : Math.floor(Date.now() / 1000),
        "meta"     : sender_user.meta.dump_object()
    };

    var random_string = generate_random_string(16);

    var content_string = JSON.stringify(json_content);
    var iv  = CryptoJS.enc.Hex.parse("0000000000000000");
    var encrypted_data = CryptoJS.AES.encrypt(content_string, random_string, {iv: iv, padding: CryptoJS.pad.NoPadding});
    json_data.data =  encrypted_data.toString();

    var crypt1 = new crypt();
    var rsa = new RSA();

    this.encrypted = crypt1.encrypt(receiver_account.public_key, JSON.stringify( json_content ));
    json_data.key = JSON.parse(this.encrypted).cipher;

    var sign = new JSEncrypt();
    sign.setPrivateKey(sender_user.private_key);
    json_data.signature = sign.sign(json_data.data, CryptoJS.SHA256, "sha256");

    console.log(json_data);

    this.json_data = json_data;
}
Message.new = function(){

};