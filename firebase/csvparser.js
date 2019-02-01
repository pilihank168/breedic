function parseFromCSV(file){
    return new Promise((resolve, reject)=>{
        codes = new Uint8Array(file);
        Papa.parse(file, {
            encoding: "big5",
            dynamicTyping: true,
            complete: function(results){
                resolve(Object.assign({}, results));
            },
            error: function(error){
                reject(error);
            }
        });
    })
}

function unparseToCSV(json_obj){
    var csv = Papa.unparse(json_obj, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n"
    });
    return csv.replace(/\n/g, "%0D%0A");
}
