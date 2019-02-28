function ID( indentifier ) {
    var pair = indentifier.split('@');
    if( pair.length != 2) {
        return null;
    }
    this.name = pair[0];
    pair = pair[1].split('/');
    this.address = pair[0];
    if(pair.length == 2)
    {
        this.terminal = pair[1];
    }
    else
    {
        this.terminal = null;
    }
}
