
const syncPositioningAndOrdering = (positions, orderArr) => {
    const newOrderArr = orderArr.slice();
    let isWrong = false
    if (orderArr.includes('+')) {
        while (newOrderArr.includes('+')) {
            const order = orderArr.slice(0, orderArr.indexOf('+'));
            newOrderArr.splice(0, newOrderArr.indexOf('+') + 1);
            isWrong = abs(positions, order);
            if (isWrong) return true;
        }
    } else {
        return abs(positions, orderArr);
    }

    return isWrong
}

const abs = (positions, order) => {
    let isWrong = false;
    if (order.some(name => name && positions.includes(name))) {
        if (isWrong) return true;
        const name = positions.find(name => name && name !== '_' && name !== '+' && order.includes(name));
        const posIndex = positions.indexOf(name);
        const orderIndex = order.indexOf(name);
        for (let i = 0; i < order.length; i++) {
            if (!order[i] || order[i] === name) continue;
            isWrong = setPositioning(positions, order[i], posIndex + i - orderIndex);
        }
        order.length = 0;
        order.push('_', ...positions.map(name => typeof name === 'string' ? name : ''), '_');
    }

    // let isWrong = false;
    // if (positions.some(name => name && name !== '_' && name !== '+' && order.includes(name))) {
    //     if (isWrong) return true;
    //     const name = positions.find(name => name && name !== '_' && name !== '+' && order.includes(name));
    //     const posIndex = positions.indexOf(name);
    //     const orderIndex = order.indexOf(name);
    //     for (let i = 0; i < order.length; i++) {
    //         if (!order[i] || order[i] === name) continue;
    //         isWrong = setPositioning(positions, order[i], posIndex + i - orderIndex);
    //     }
    // } else if (order.includes('_')) {
    //     for (let i = 0; i < order.length; i++) {
    //         if (isWrong) return true;
    //         const name = order[i];
    //         if (!name || name === '_') continue;
    //         const limitIndex = order.indexOf('_');
    //         if (limitIndex === 0) {
    //             isWrong = setPositioning(positions, name, i - 1);
    //         } else {
    //             isWrong = setPositioning(positions, name, positions.length - order.length + i + 1);
    //         }
    //     }
    //
    //     return isWrong;
    // } else {
    //     const leftIndex = !order[0] ? 1 : 0;
    //     const rightIndex = !order[order.length - 1] ? order.length - 2 : order.length - 1;
    //     const chainNumber = rightIndex - leftIndex + 1;
    //     let incrChainNumber = 0;
    //     const possiblePlaces = [];
    //
    //     for (let i = 0; i < positions.length - chainNumber + 1; i++) {
    //         for (let j = 0; j < chainNumber; j++) {
    //             if (typeof positions[i + j] !== 'object' || !positions[i + j].includes(order[leftIndex + j])) {
    //                 incrChainNumber = 0;
    //                 break;
    //             }
    //             incrChainNumber++;
    //         }
    //         if (incrChainNumber === chainNumber) possiblePlaces.push(i);
    //         incrChainNumber = 0;
    //     }
    //
    //     if (!possiblePlaces.length) return true;
    //
    //     if (possiblePlaces.length === 1) {
    //         for (let i = 0; i < positions.length; i++) {
    //             positions[i + possiblePlaces[0]] = order[leftIndex + i];
    //         }
    //     } else {
    //         for (let i = 0; i < chainNumber; i++) {
    //             if (typeof positions[i] === 'object')
    //                 positions[i] = positions[i].filter(name => !order.slice(leftIndex + i + 1, rightIndex + 1).includes(name));
    //             if (typeof positions[positions.length - i - 1] === 'object')
    //                 positions[positions.length - i - 1] = positions[positions.length - i - 1].filter(name => !order.slice(leftIndex, rightIndex - i).includes(name));
    //             if (positions[i].length === 1) positions[i] = positions[i][0];
    //             if (positions[positions.length - i - 1].length === 1) positions[positions.length - i - 1] = positions[positions.length - i - 1][0];
    //         }
    //     }
    //
    // }
}


const setOrdering = (order, name, {front, behind}) => {
    const mainIndex = order.indexOf(name);
    if (front !== name && order.includes(front)) return true;
    if (behind !== name && order.includes(behind)) return true;
    if (front && order[mainIndex - 1]) return true;
    if (behind && order[mainIndex + 1]) return true;

    if (front) order[mainIndex - 1] = front;
    if (behind) order[mainIndex + 1] = behind;
};

const setPositioning = (positions, name, positionIndex) => {
    if (positions.includes(name) && positions.indexOf(name) !== positionIndex) return true;
    if (positions.includes(name) && positions.indexOf(name) === positionIndex) return false;
    if (positionIndex < 0 || positionIndex >= positions.length) return true;

    for (let i = 0; i < positions.length; i++) {
        if (i === positionIndex) positions[i] = name;
        else if (typeof positions[i] === 'object' && positions[i].includes(name)) positions[i].splice(positions[i].indexOf(name), 1);
    }


    for (let i = 0; i < positions.length; i++) {
        if (typeof positions[i] === 'object' && positions[i].length === 1) positions[i] = positions[i][0];
        if (typeof positions[i] === 'object' && positions[i].length === 0) return true;
    }
}

const getPosition = (name, assertion, {order, positions}) => {
    let newName;
    let position;
    switch (true) {
        case assertion.includes('The man behind me is'):
            newName = assertion.split(' ')[5];
            newName = newName.includes('.') ? newName.substring(0, newName.length - 1) : newName;

            return setOrdering(order, name, {behind: newName})
                || (positions.includes(name) && setPositioning(positions, newName, positions.indexOf(name) + 1))
                || (positions.includes(newName) && setPositioning(positions, name, positions.indexOf(newName) - 1))
                || syncPositioningAndOrdering(positions, order);
        case assertion.includes("The man in front of me is"):
            newName = assertion.split(' ')[7]
            newName = newName.includes('.') ? newName.substring(0, newName.length - 1) : newName;
            return setOrdering(order, name, {front: newName})
                || (positions.includes(name) && setPositioning(positions, newName, positions.indexOf(name) - 1))
                || (positions.includes(newName) && setPositioning(positions, name, positions.indexOf(newName) + 1))
                || syncPositioningAndOrdering(positions, order);
        case assertion.includes("I'm in "):
            position = Number(assertion.match(/\d+/g)[0]) - 1;

            if (position === 0 && order[0] !== '_') {
                order[0] = '_';
            } else if (position === 1 && order[0] !== '_') {
                order.unshift('_');
            }
            if (position === positions.length - 2 && order[order.length - 1] !== '_') {
                order.push('_');
            } else if (position === positions.length - 1 && order[order.length - 1] !== '_') {
                order[2] = '_'
            }

            return setPositioning(positions, name, position) || syncPositioningAndOrdering(positions, order);
        case assertion.includes('people in front of me'):
            position = Number(assertion.split(' ')[2]);

            if (position === 0 && order[0] !== '_') {
                order[0] = '_';
            } else if (position === 1 && order[0] !== '_') {
                order.unshift('_');
            }
            if (position === positions.length - 2 && order[order.length - 1] !== '_') {
                order.push('_');
            } else if (position === positions.length - 1 && order[order.length - 1] !== '_') {
                order[2] = '_'
            }

            return setPositioning(positions, name, position) || syncPositioningAndOrdering(positions, order);
        case assertion.includes('people behind me'):
            position = positions.length - 1 - Number(assertion.split(' ')[2]);

            if (position === 0 && order[0] !== '_') {
                order[0] = '_';
            } else if (position === 1 && order[0] !== '_') {
                order.unshift('_');
            }
            if (position === positions.length - 2 && order[order.length - 1] !== '_') {
                order.push('_');
            } else if (position === positions.length - 1 && order[order.length - 1] !== '_') {
                order[2] = '_'
            }


            return setPositioning(positions, name, position) || syncPositioningAndOrdering(positions, order);
    }
}

const getPositionArray = (peopleNumber, peopleNames) => {
    const array = [];
    for (let i = 0; i < peopleNumber; i++) {
        array.push(peopleNames.slice());
    }
    return array
}
// merge only orders without +
const mergeOrders = (firstOrder, secondOrder) => {
    const name = firstOrder.find(name => name && name !== '_' && secondOrder.includes(name));
    let firstIndex = firstOrder.indexOf(name);
    let secondIndex = secondOrder.indexOf(name);
    let fi = firstIndex + 1;
    let fj = firstIndex - 1;
    let si = secondIndex + 1;
    let sj = secondIndex - 1;

    const resultOrder = [name];

    while (firstOrder[fi] !== undefined || firstOrder[fj] !== undefined || secondOrder[si] !== undefined || secondOrder[sj] !== undefined) {
        if (firstOrder[fi] || secondOrder[si]) resultOrder.push(firstOrder[fi] || secondOrder[si]);
        if (firstOrder[fj] || secondOrder[sj]) resultOrder.unshift(firstOrder[fj] || secondOrder[sj]);
        fi++;
        fj--;
        si++;
        sj--;
    }

    return resultOrder;
}

const manageOrders = (firstOrder, secondOrder) => {
    const name = firstOrder.find(name => name && name !== '_' && name !== '+' && secondOrder.includes(name));
    const firstOrderF = firstOrder.join(',').match(',');
    if (!name) {
        return secondOrder[0] === '_' || firstOrder[firstOrder.length - 1] === '_' ?
            [...secondOrder, '+', ...firstOrder] :
            [...firstOrder, '+', ...secondOrder];
    }
    let firstOrderToMerge;
    let secondOrderToMerge;
    let tempArr = [];
    const firstOrderArr = firstOrder.reduce((acc, name) => {
        if (name === '+') {
            acc.push(tempArr);
            if (tempArr.includes(name)) firstOrderToMerge = tempArr;
            tempArr = [];
        } else {
            tempArr.push(name);
        }
        return acc;
    }, []);
    const secondOrderArr = secondOrder.reduce((acc, name) => {
        if (name === '+') {
            acc.push(tempArr);
            if (tempArr.includes(name)) secondOrderToMerge = tempArr;
            tempArr = [];
        } else {
            tempArr.push(name);
        }
        return acc;
    }, []);

    let mergedOrder = mergeOrders(firstOrderToMerge || firstOrder, secondOrderToMerge || secondOrder);

    for (let i = 0; i < firstOrderArr.length; i++) {
        const tempOrder = firstOrderArr[i];
        const name = mergedOrder.find(name => name && name !== '_' && name !== '+' && tempOrder.includes(name));
        if (name) {
            mergedOrder = mergeOrders(mergedOrder, tempOrder);
            firstOrderArr[i] = null;
            firstOrderArr.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < secondOrderArr.length; i++) {
        const tempOrder = secondOrderArr[i];
        const name = mergedOrder.find(name => name && name !== '_' && name !== '+' && tempOrder.includes(name));
        if (name) {
            mergedOrder = mergeOrders(mergedOrder, tempOrder);
            secondOrderArr.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < firstOrderArr.length > secondOrderArr.length ? firstOrderArr.length : secondOrderArr.length; i++) {
        if (firstOrderArr[i]) mergedOrder.push('+', ...firstOrderArr[i]);
        if (secondOrderArr[i]) mergedOrder.push('+', ...secondOrderArr[i]);
    }

    return mergedOrder;
}

const findVersion = (firstPerson, secondPerson) => {
    const isOrderRight = firstPerson.order.every((name, index, arr) => {
        if (name && name !== '_' && secondPerson.order.includes(name)) {
            const secondIndex = secondPerson.order.indexOf(name);
            const isLeftOk = !arr[index - 1] || !secondPerson.order[secondIndex - 1] || (arr[index - 1] === '_' && !secondPerson.order[secondIndex - 1]) || arr[index - 1] === secondPerson.order[secondIndex - 1];
            const isRightOk = !arr[index + 1] || !secondPerson.order[secondIndex + 1] || (arr[index + 1] === '_' && !secondPerson.order[secondIndex + 1]) || arr[index + 1] === secondPerson.order[secondIndex + 1];

            return isLeftOk && isRightOk;
        }
        return true;
    })
    const isOrderConnected = isOrderRight && firstPerson.order.reduce((acc, name) => {
        if (name && name !== '+' && name !== '_' && secondPerson.order.includes(name)) {
            return acc + 1;
        }
        return acc;
    }, 0) > 1;

    const isPositionRight = !firstPerson.positions.some((position, index) => {
        if (typeof position === 'object') {
            if (typeof secondPerson.positions[index] === 'object') {
                return !position.some(name => secondPerson.positions[index].includes(name));
            } else {
                return !position.includes(secondPerson.positions[index]);
            }
        } else {
            if (typeof secondPerson.positions[index] === 'object') {
                return !secondPerson.positions[index].includes(position);
            } else {
                return secondPerson.positions[index] !== position
            }
        }
    });

    const isPositionConnected = isPositionRight && firstPerson.positions.some((position, index) => position === secondPerson.positions[index]);

    return {isOrderRight, isOrderConnected, isPositionRight, isPositionConnected};
}

function findOutMrWrong(conversation) {
    let peopleNames = Array.from(new Set(conversation.map(speech => speech.substring(0, speech.indexOf(':')))));
    const peopleNumber = peopleNames.length;

    let version = {
        positions: getPositionArray(peopleNumber, peopleNames),
        order: []
    };


    const people = conversation.sort().reduce((acc, speech) => {
        const personName = speech.substring(0, speech.indexOf(':'));
        const assertion = speech.substring(speech.indexOf(':') + 1);
        if (!acc[personName]) {
            acc[personName] = {
                positions: getPositionArray(peopleNumber, peopleNames),
                order: ['', personName, ''],
                isWrong: false
            }
        }

        acc[personName].isWrong = getPosition(personName, assertion, acc[personName]);

        return acc;
    }, {});

    let i = 0;
    let j = 1;
    let isVersionCreated = false;
    let mrWrong = peopleNames.find(name => people[name].isWrong)
    if (mrWrong) return mrWrong;


    while (peopleNames.length > 1 && i < peopleNames.length - 1) {
        const firstPerson = people[peopleNames[i]];
        const secondPerson = people[peopleNames[j]];

        let skipComparison = false;
        if (isVersionCreated) {
            const first = findVersion(version, firstPerson);
            if (!first.isOrderRight || !first.isPositionRight) return peopleNames[i];

            if (first.isPositionConnected || first.isOrderConnected) {
                version.positions = version.positions.map((vPosition, index) => {
                    if (typeof vPosition === 'string') return vPosition;
                    if (typeof firstPerson.positions[index] === 'string') return firstPerson.positions[index];
                    return vPosition.filter(name => firstPerson.positions[index].includes(name));
                });
                if (version.order.length) {
                    version.order = manageOrders(version.order, firstPerson.order);
                } else {
                    version.order = firstPerson.order;
                }
                peopleNames.splice(peopleNames.indexOf(peopleNames[i]), 1);
                skipComparison = true;
                j = i + 1;
            }

            const second = findVersion(version, secondPerson);
            if (second.isPositionConnected || second.isOrderConnected) {
                if (!second.isOrderRight || !second.isPositionRight) return peopleNames[j];

                version.positions = version.positions.map((vPosition, index) => {
                    if (typeof vPosition === 'string') return vPosition;
                    if (typeof secondPerson.positions[index] === 'string') return secondPerson.positions[index];
                    return vPosition.filter(name => secondPerson.positions[index].includes(name));
                });

                if (version.order.length) {
                    version.order = manageOrders(version.order, secondPerson.order);
                } else {
                    version.order = secondPerson.order;
                }
                peopleNames.splice(peopleNames.indexOf(peopleNames[j]), 1);
            }
        }

        if (!skipComparison) {
            const {isOrderConnected, isPositionConnected} = findVersion(firstPerson, secondPerson);


            if (isPositionConnected || isOrderConnected) {
                version.positions = version.positions.map((vPosition, index) => {
                    if (typeof vPosition === 'string') return vPosition;
                    if (typeof firstPerson.positions[index] === 'string') return firstPerson.positions[index];
                    if (typeof secondPerson.positions[index] === 'string') return secondPerson.positions[index];
                    return vPosition.filter(name => firstPerson.positions[index].includes(name) && secondPerson.positions[index].includes(name));
                });

                if (version.order.length) {
                    version.order = manageOrders(version.order, firstPerson.order);
                    version.order = manageOrders(version.order, secondPerson.order);
                } else {
                    version.order = manageOrders(firstPerson.order, secondPerson.order)
                }
                syncPositioningAndOrdering(version.positions, version.order);
                peopleNames = peopleNames.filter((_, index) => index !== i && index !== j);
                j = i + 1;
                isVersionCreated = true;
            } else {
                if (j === peopleNames.length - 1) {
                    i++;
                    j = i + 1;
                } else {
                    j++;
                }
            }
        }
        skipComparison = false;
    }

    const conflicts = {};

    if (!isVersionCreated) {
        for (let i = 0; i < peopleNames.length; i++) {
            const name = peopleNames[i];
            version = people[name];
            let isWrong = false;
            for (j = 0; j < peopleNames.length; j++) {
                if (i === j) continue;
                const person = people[peopleNames[j]];
                const {isOrderRight, isPositionRight} = findVersion(version, people[peopleNames[j]]);
                if (isOrderRight && isPositionRight) {
                    version.positions = version.positions.map((vPosition, index) => {
                        if (typeof vPosition === 'string') return vPosition;
                        if (typeof person.positions[index] === 'string') return person.positions[index];
                        return vPosition.filter(name => person.positions[index].includes(name));
                    });
                    if (version.order.length) {
                        version.order = manageOrders(version.order, person.order);
                    } else {
                        version.order = person.order;
                    }
                    isWrong = syncPositioningAndOrdering(version.positions, version.order);
                } else {
                    conflicts[name] = (conflicts[name] || 0) + 1;
                }
            }
        }
    }

    if (peopleNames.length === 1) return peopleNames[0];

    return null;
}

// {
//  positions: ['', 'John', '', ''],
//  before: string,
//  after: string,
// }

const conversation = [
    "Mqcbqvt:I'm in 1st position.",
    "Simmpdd:The man behind me is Vdna.",
    "Vdna:There is 1 people in front of me.",
    "Hadvcqazg:The man behind me is Mqcbqvt."
];

console.log(findOutMrWrong(conversation));