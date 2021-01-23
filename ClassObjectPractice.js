
//const errNum = 'Error 404'

class Error {
    constructor(message, status = 404){
        this.message = message;
        this.status = status
    } 
}

const myErr = new Error('This is')
myErr.status = 200

console.log(myErr.message, myErr.status)



//how to sum big numbers

var n = 10; //0000000000;

var y = n *( n+1 ) / 2

console.log(y) 