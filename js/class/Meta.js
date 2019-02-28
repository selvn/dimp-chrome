function Meta( seed, private_key, public_key, version = 0x01 ) {
    var sign = new JSEncrypt();
    sign.setPrivateKey(private_key);
    var fingerprint = sign.sign(seed, CryptoJS.SHA256, "sha256");

    this.seed = seed;
    this.version = version;
    this.public_key = public_key;
    this.fingerprint = fingerprint;

    this.dump_object = function () {
        return {
            "version" : this.version,
            "seed"    : this.seed,
            "key"     : this.public_key,
            "fingerprint" : this.fingerprint
        }
    }
}
