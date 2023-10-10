function countShips(arr) {
    let shipNumber = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j - 1] === 1 || (arr[i - 1] !== undefined && arr[i - 1][j] === 1)) continue;
            if (arr[i][j] === 1) shipNumber++;
        }
    }


    return shipNumber;
}


// mxm
const field = [
  [1, 0, 0, 1],
  [1, 0, 0, 0],
  [0, 1, 1, 1],
  [1, 0, 0, 0]
]

console.log(countShips(field))

// result 4