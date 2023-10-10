

function nextBigger(n){
    const numberArray = n.toString().split('');
    let finalIndex = numberArray.length;

    const restArray = [];

    for(let i = numberArray.length - 2; i >= 0; i--) {
        const currentNumber = numberArray[i];

        if(currentNumber < numberArray[i+1]) {
            finalIndex = i;
            break;
        }
        let insertIndex = restArray.length;
        for (let j = 0; j < restArray.length; j++) {
            if(restArray[j] >= currentNumber){
                insertIndex = j;
                break;
            }
        }
        restArray.splice(insertIndex, 0, currentNumber);
    }

    if(finalIndex === numberArray.length) return -1;
    let finalNumber = numberArray[finalIndex];
    let c = 0;
    for(let i = 0; i < restArray.length; i++) {
        if(restArray[i] > finalNumber) {
            c = restArray[i];
            restArray[i] = finalNumber;
            finalNumber = c;
            break;
        }
    }

    return Number(numberArray.slice(0, finalIndex).join('') + finalNumber + restArray.join(''));
}

console.log(nextBigger(2017));