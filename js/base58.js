var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var ALPHABET_MAP = {};
for(var i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i
}
var BASE = 58;

function base58_encode(buffer) {
    if (buffer.length === 0) return ''

    var i, j, digits = [0]
    for (i = 0; i < buffer.length; i++) {
        for (j = 0; j < digits.length; j++) digits[j] <<= 8

        digits[0] += buffer[i]

        var carry = 0
        for (j = 0; j < digits.length; ++j) {
            digits[j] += carry

            carry = (digits[j] / BASE) | 0
            digits[j] %= BASE
        }

        while (carry) {
            digits.push(carry % BASE)

            carry = (carry / BASE) | 0
        }
    }

    // deal with leading zeros
    for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0)

    return digits.reverse().map(function(digit) { return ALPHABET[digit] }).join('')
}

function base58_decode(string) {
    if (string.length === 0) return []

    var i, j, bytes = [0]
    for (i = 0; i < string.length; i++) {
        var c = string[i]
        if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character')

        for (j = 0; j < bytes.length; j++) bytes[j] *= BASE
        bytes[0] += ALPHABET_MAP[c]

        var carry = 0
        for (j = 0; j < bytes.length; ++j) {
            bytes[j] += carry

            carry = bytes[j] >> 8
            bytes[j] &= 0xff
        }

        while (carry) {
            bytes.push(carry & 0xff)

            carry >>= 8
        }
    }

    // deal with leading zeros
    for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0)

    return bytes.reverse()
}

function stringToBytes(str) {
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);  // get char
        st = [];                 // set up "stack"

        do {
            st.push(ch & 0xFF);  // push byte to stack
            ch = ch >> 8;          // shift value down by 1 byte
        }

        while (ch);
        // add stack contents to result
        // done because chars have "wrong" endianness
        re = re.concat(st.reverse());
    }
    // return an array of bytes
    return re;
}