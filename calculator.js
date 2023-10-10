const calculate = (num1, num2, operator) => {
    switch (operator) {
        case '*':
            return num1 * num2;
        case '/':
            return num1 / num2;
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
    }

}

const operationWithExp = (expArr, operator) => {
    if(expArr.length === 2) {
        return [calculate(0, Number(expArr[1]), expArr[0])]
    }

    const index = expArr.indexOf(operator);
    const tempArr = [...expArr];

    let factor = 0;
    while(!Number(tempArr[index + 1])){
        tempArr.splice(index + 1, 1);
        factor++;
    }

    const tempResult = calculate(Number(tempArr[index - 1]), Number(tempArr[index + 1])*((-1)**factor), operator);
    tempArr.splice(index - 1, 3 + factor, tempResult);
    return tempArr;
}

function calcExpression(expression) {
    let expArr = expression.match(/^[-][0-9]+[\.]*[0-9]*|(?<=[-+\/*][ ]*)[-][0-9]+[\.]*[0-9]*|[0-9]+[\.]*[0-9]*|[-+\/*]/g);
    let i = 0;
    while (expArr.length > 1 && i++ < 100) {
        const multiply = expArr.includes('*') ? expArr.indexOf('*') : Infinity;
        const divide = expArr.includes('/') ? expArr.indexOf('/') : Infinity;
        const plus = expArr.includes('+') ? expArr.indexOf('+') : Infinity;
        const minus = expArr.includes('-') ? expArr.indexOf('-') : Infinity;
        if (expArr.includes('*') && (multiply < divide)) {
            expArr = operationWithExp(expArr, '*');
        } else if (expArr.includes('/') && (divide < multiply)) {
            expArr = operationWithExp(expArr, '/');
        } else if (expArr.includes('+') && (plus < minus)) {
            expArr = operationWithExp(expArr, '+');
        } else if (expArr.includes('-') && ((minus < plus))) {
            expArr = operationWithExp(expArr, '-');
        }
    }

    return Number(expArr[0]);
}


function calc(expression) {
    let bracketCoef = 1;
    let newExpression = expression;

    while (newExpression.includes('(')) {
        const leftIndex = newExpression.indexOf('(');
        let rightIndex;

        for (let i = leftIndex + 1; i < newExpression.length; i++) {
            if (newExpression[i] === '(') {
                bracketCoef += 1;
            } else if (newExpression[i] === ')') {
                bracketCoef -= 1;
            }
            if (bracketCoef === 0) {
                rightIndex = i;
                break;
            }
        }
        bracketCoef = 1;
        newExpression = newExpression.substring(0, leftIndex) + calc(newExpression.substring(leftIndex + 1, rightIndex)) + newExpression.substring(rightIndex + 1);
    }

    return calcExpression(newExpression);
}


// console.log(calc('222+2*2*2-230/2')) // 6
console.log(calc("123.45*(678.90 / (-2.5+ 11.5)-(80 -19) *33.25) / 20 + 11")) // 8

// 3) calc('2+2 +**/ 3 + 3') // 10