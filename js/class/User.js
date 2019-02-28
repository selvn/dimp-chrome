function Account( ID_string, public_key) {
    this.public_key = public_key;
    this.ID_string = ID_string;
}

function User( identifier_ID, private_key, meta ) {
    Account.apply(this, [identifier_ID, meta.public_key]);
    this.meta = meta;
    this.private_key = private_key;
    this.fingerprint = meta.fingerprint;
    this.contacts = [];
}
