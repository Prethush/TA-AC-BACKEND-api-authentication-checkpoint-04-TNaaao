function random(){
    let numStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", str = "";
    for(let i = 0; i < 6; i++){
        str += numStr[(Math.floor(Math.random() * 35))];
    }
    return str;
}

module.exports = random;