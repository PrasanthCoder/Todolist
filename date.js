
module.exports.getdate = function (){
    const today = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }

    return today.toLocaleString("en-US", options); 
}

module.exports.getday = function (){
    const today = new Date();
    const options = {
        weekday: "long",
    }

    return today.toLocaleString("en-US", options); 
}