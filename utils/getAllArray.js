function getAllArray(array) {
    var data = "";
    for (var i = 0; i < array.length; i++) {
        data += array[i];
    }
    return data;
};

module.exports = { getAllArray };
