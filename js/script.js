document.addEventListener('DOMContentLoaded', function() {
    console.log('here');
    console.log(document.getElementById('app'));
    // Still cannot use alert() but you can manipulate your window in other ways.
    var data = {
        logged: false, //登陆状态
        server_message:''
    };

    $('#login_button').on('click', onclick);

});

function onclick() {
    console.log('gewfew');

    chrome.sockets.tcp.create({bufferSize:4096}, function(createInfo) {
        console.log(createInfo);
        chrome.sockets.tcp.connect(createInfo.socketId,
            '149.129.93.227', 8998, function (response) {
                console.log(response);
                var buffer = str2ab('helloworld!');
                chrome.sockets.tcp.send(createInfo.socketId, buffer, function () {
                    console.log('sent.');
                });
            });
    });
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

function connect_server() {

}