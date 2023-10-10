

const getIsRotated = (form) => {
    return !form[0].includes(0)
}

const getDeepness = (form, isRotated) => {
    let deepness = 0;
    for(let i = 0; i < form.length; i++) {
        let isNoZero;
        if(isRotated) {
            isNoZero = !form[form.length - 1 - i].includes(0);
        } else {
            isNoZero = !form[i].includes(0);
        }

        if(isNoZero) {
            break;
        }
        deepness++;
    };

    return deepness
}

const getIsFit = (firstForm, isRotated, deepness, secondForm) => {
    let isTopFit = true;
    let isBottomFit = true;
    for ( let i = 0; i < deepness; i++) {
        if(!isTopFit && !isBottomFit) return false;

        const index = isRotated ? firstForm.length - 1 - i : i;
        const rowToCompare = firstForm[index];

        const topBlockIndex = deepness - i - 1;
        const bottomBlockIndex = secondForm.length - deepness + i;

        rowToCompare.forEach((cell, cellIndex, arr) => {
            if(!isTopFit && !isBottomFit) return;

            const topCellIndex = isRotated ? cellIndex : arr.length - 1 - cellIndex;
            const bottomCellIndex = isRotated ? arr.length - 1 - cellIndex : cellIndex;

            if(cell + secondForm[topBlockIndex][topCellIndex] !== 1) {
                isTopFit = false;
            }
            if(cell + secondForm[bottomBlockIndex][bottomCellIndex] !== 1) {
                isBottomFit = false;
            }
        })
    }

    if(isTopFit) {
        return {
            isRotated: true
        }
    }

    if(isBottomFit) {
        return {
            isRotated: false
        }
    }

}

function layout(blocks) {
    const blockPositions = [];
    const restBlocks = blocks.slice(1);
    let position = 2;
    let currentBlock = blocks[0];
    let isCurrentRotated = getIsRotated(currentBlock.form);
    let currentDeepness = getDeepness(currentBlock.form, isCurrentRotated);

    blockPositions.push({
        id: currentBlock.id,
        position: 1,
        isRotated: isCurrentRotated,
    });

    let i = 0;
    while (restBlocks.length > 0) {
        const secondBlock = restBlocks[i];


        const result = getIsFit(currentBlock.form, isCurrentRotated, currentDeepness, secondBlock.form);

        if(result) {
            blockPositions.push({
                id: secondBlock.id,
                position: position,
                isRotated: result.isRotated,
            });
            currentBlock = secondBlock;
            isCurrentRotated = result.isRotated;
            currentDeepness = getDeepness(currentBlock.form, isCurrentRotated);
            restBlocks.splice(i, 1);
            position++;
            i = 0;
        } else {
            i++;
        };

    }


    return blockPositions
}


const blocks = [{
    "id": 443,
    "form": [
        [1, 0, 1],
        [1, 1, 1]
    ]
},
    {
        "id": 327,
        "form": [
            [0, 1, 0],
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
            [0, 1, 0]
        ]
    },
    {
        "id": 891,
        "form": [
            [0, 0, 1],
            [1, 0, 1],
            [1, 1, 1]
        ]
    }];
console.log(layout(blocks))