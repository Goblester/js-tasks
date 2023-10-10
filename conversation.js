const setPositioning = (person, name, positionIndex) => {
    if (
        person.positions.includes(name) && person.positions[positionIndex] !== name
        || (typeof person.positions[positionIndex] === 'object' && !person.positions[positionIndex]?.includes(name))) {
        person.isWrong = true;
    }

    person.positions[positionIndex] = name;

    person.positions = person.positions.map(position => {
            if (typeof position === 'string') return position;

            const arr = position.filter(posName => posName !== name);
            if (arr.length === 0) person.isWrong = true;

            return arr.length === 1 ? arr[0] : arr;
        }
    );
}

const syncOrderAndPosition = (person) => {
    if (typeof person.positions[0] === 'object') {
        if (person.front) person.positions[0] = person.positions[0].filter(name => name !== person.name);
        if (person.behind) person.positions[0] = person.positions[0].filter(name => name !== person.behind);
    }
    if (typeof person.positions[1] === 'object' && person.front && person.behind) {
        person.positions[1] = person.positions[1].filter(name => name !== person.behind);
    }
    if (typeof person.positions[person.positions.length - 2] === 'object' && person.front && person.behind) {
        person.positions[person.positions.length - 2] = person.positions[person.positions.length - 2].filter(name => name !== person.front);
    }
    if (typeof person.positions[person.positions.length - 1] === 'object') {
        if (person.front) person.positions[person.positions.length - 1] = person.positions[person.positions.length - 1].filter(name => name !== person.front);
        if (person.behind) person.positions[person.positions.length - 1] = person.positions[person.positions.length - 1].filter(name => name !== person.name);
    }
    person.positions = person.positions.map(position => {
            if (typeof position === 'string') return position;

            if (position.length === 0) person.isWrong = true;

            return position.length === 1 ? position[0] : position;
        }
    );
}

const setAssertion = (name, assertion, person) => {
    let newName;
    let position;
    switch (true) {
        case assertion.includes('The man behind me is'):
            newName = assertion.split(' ')[5];
            newName = newName.includes('.') ? newName.substring(0, newName.length - 1) : newName;

            person.behind = newName;
            if (person.positions.includes(person.name)) setPositioning(person, person.behind, person.positions.indexOf(person.name) + 1);
            syncOrderAndPosition(person);

            break;

        case assertion.includes("The man in front of me is"):
            newName = assertion.split(' ')[7]
            newName = newName.includes('.') ? newName.substring(0, newName.length - 1) : newName;

            person.front = newName;

            if (person.positions.includes(person.name)) setPositioning(person, person.front, person.positions.indexOf(person.name) - 1);
            syncOrderAndPosition(person);

            break;

        case assertion.includes("I'm in "):
            position = Number(assertion.match(/\d+/g)[0]) - 1;

            setPositioning(person, name, position);
            if (person.front) setPositioning(person, person.front, position - 1);
            if (person.behind) setPositioning(person, person.behind, position + 1);

            break;

        case assertion.includes('people in front of me'):
            position = Number(assertion.split(' ')[2]);

            setPositioning(person, name, position);

            if (person.front) setPositioning(person, person.front, position - 1);
            if (person.behind) setPositioning(person, person.behind, position + 1);
            break;

        case assertion.includes('people behind me'):
            position = person.positions.length - 1 - Number(assertion.split(' ')[2]);

            setPositioning(person, name, position);
            break;

    }
}

const getPositionArray = (peopleNumber, peopleNames) => {
    const array = [];
    for (let i = 0; i < peopleNumber; i++) {
        array.push(peopleNames.slice());
    }
    return array
}

const setVersionPositions = (version, person) => {
    version.positions = version.positions.map((versionPos, index) => {
        const personPos = person.positions[index];
        if (typeof versionPos === 'string' && typeof personPos === 'string') {
            if (versionPos !== personPos) person.isWrong = true;
            return versionPos;
        } else if (typeof versionPos === 'object' && typeof personPos === 'string') {
            if (!versionPos.includes(personPos)) person.isWrong = true;
            return personPos;
        } else if (typeof versionPos === 'string' && typeof personPos === 'object') {
            if (!personPos.includes(versionPos)) person.isWrong = true;
            return versionPos;
        } else {
            return versionPos.filter(name => personPos.includes(name));
        }
    })
}

const setVersionOrders = (version, person) => {
    if (!person.front && !person.behind) return;
    if (version.order.length === 0) {
        version.order.push({array: [], people: [person]});
        if (person.front) version.order[0].array.push(person.front);
        version.order[0].array.push(person.name)
        if (person.behind) version.order[0].array.push(person.behind);
        return;
    }

    let isConnected;
    let connectIndex;
    for (let i = 0; i < version.order.length; i++) {
        const orderArray = version.order[i].array;
        if (person.front && orderArray.includes(person.front)) {
            isConnected = true;
            const index = orderArray.indexOf(person.front);
            if (orderArray[index + 1]) {
                if (orderArray[index + 1] !== person.name) person.isWrong = true;
                else {
                    person.isApproved = true;
                    if (person.behind) {
                        if (orderArray[index + 2] && orderArray[index + 2] !== person.behind) person.isWrong = true;
                        else if (!orderArray[index + 2]) orderArray.push(person.behind);
                    }
                }
            } else {
                orderArray.push(person.name)
                if (person.behind) orderArray.push(person.behind);
            }
        } else if (person.behind && orderArray.includes(person.behind)) {
            isConnected = true;
            const index = orderArray.indexOf(person.behind);
            if (orderArray[index - 1]) {
                if (orderArray[index - 1] !== person.name) person.isWrong = true;
                else {
                    person.isApproved = true;
                    if (person.front) {
                        if (orderArray[index - 2] && orderArray[index - 2] !== person.front) person.isWrong = true;
                        else if (!orderArray[index - 2]) orderArray.unshift(person.front);
                    }
                }
            } else {
                orderArray.unshift(person.name)
                if (person.front) orderArray.unshift(person.front);
            }
        } else if (orderArray.includes(person.name)) {
            isConnected = true;
            const index = orderArray.indexOf(person.name)
            if (person.front) {
                if (orderArray[index - 1]) {
                    if (orderArray[index - 1] !== person.front) person.isWrong = true;
                    else person.isApproved = true;
                } else orderArray.unshift(person.front);
            }
            if (person.behind) {
                if (orderArray[index + 1]) {
                    if (orderArray[index + 1] !== person.behind) person.isWrong = true;
                    else person.isApproved = true;
                } else orderArray.push(person.behind);
            }
        }
        if (isConnected) {
            version.order[i].people.push(person);
            connectIndex = i;
            break;
        }
    }

    if (isConnected) {
        const connectArray = version.order[connectIndex].array;
        for (let i = 0; i < version.order.length; i++) {
            const orderArray = version.order[i].array;
            if (i === connectIndex) continue;
            if (connectArray.some(name => orderArray.includes(name))) {
                const connectName = connectArray.find(name => orderArray.includes(name));
                const newOrder = [connectName];
                let firstI = connectArray.indexOf(connectName) - 1;
                let secondI = orderArray.indexOf(connectName) - 1;
                let firstJ = connectArray.indexOf(connectName) + 1;
                let secondJ = orderArray.indexOf(connectName) + 1;
                while (firstI <= 0 && secondI <= 0 && firstJ < connectArray.length && secondJ < orderArray.length) {
                    if (connectArray[firstI] && orderArray[secondI] && connectArray[firstI] !== orderArray[secondI]) {
                        //TODO nado podumat
                        console.log('bad case')
                    } else {
                        const leftName = connectArray[firstI] || orderArray[secondI];
                        if (leftName) newOrder.unshift(leftName);
                        firstI--;
                        secondI--;
                    }

                    if (connectArray[firstJ] && orderArray[secondJ] && connectArray[firstJ] !== orderArray[secondJ]) {
                        //TODO nado podumat
                        console.log('bad case')
                    } else {
                        const rightName = connectArray[firstJ] || orderArray[secondJ];
                        if (rightName) newOrder.push(rightName);
                        firstJ++;
                        secondJ++;
                    }
                    //TODO подумать про approved среди мердженных массивов
                }

                version.order = version.order.reduce((acc, cur, ind) => {
                    if (ind !== connectIndex && ind !== i) acc.push(cur);
                    return acc
                }, [{
                    array: newOrder,
                    people: [...version.order[connectIndex].people, ...version.order[i].people]
                }]);
                break;
            }
        }
    }

}

function findOutMrWrong(conversation) {
    let peopleNames = Array.from(new Set(conversation.map(speech => speech.substring(0, speech.indexOf(':')))));
    const peopleNumber = peopleNames.length;

    const people = conversation.sort().reduce((acc, speech) => {
        const personName = speech.substring(0, speech.indexOf(':'));
        const assertion = speech.substring(speech.indexOf(':') + 1);
        if (!acc[personName]) {
            acc[personName] = {
                positions: getPositionArray(peopleNumber, peopleNames),
                name: personName,
                behind: null,
                front: null,
                isWrong: false,
                isApproved: false,
            }
        }

        setAssertion(personName, assertion, acc[personName]);

        return acc;
    }, {});

    const mrWrongs = peopleNames.filter(name => people[name].isWrong);

    if (mrWrongs.length) {
        return mrWrongs.length === 1 ? mrWrongs[0] : null;
    }
    let version;
    let tempPeopleNames = [...peopleNames];
    while (true) {
        version = {
            positions: getPositionArray(peopleNumber, peopleNames),
            order: [],

        };
        // const savedVersion = {positions: version.positions.map(pos => typeof pos === 'object')};
        let isMrWrongPushed = false;
        for (let i = 0; i < tempPeopleNames.length; i++) {
            const person = people[tempPeopleNames[i]];
            setVersionPositions(version, person);
            setVersionOrders(version, person);
            if (person.isWrong) {
                mrWrongs.push(person)
                tempPeopleNames.splice(i, 1);
                isMrWrongPushed = true;
                break;
            }
        }
        if (!isMrWrongPushed) {
            break;
        }
    }

    const savedVersion = {positions: version.positions.map(pos => typeof pos === 'object' ? pos.slice() : pos), order: version.order.map(ord => ord.slice())};
    mrWrongs.forEach(person => {
        person.isWrong = false;
    });

    const finalMrWrongs = [];
    let i = 0;
    while (i < mrWrongs.length) {
        const person = people[peopleNames[i]];
        setVersionPositions(version, person);
        setVersionOrders(version, person);
        if (person.isWrong) {
            finalMrWrongs.push(person);
            version = savedVersion;
        }
        i++;
    }

    if(finalMrWrongs.length > 0) {
        return finalMrWrongs.length === 1 ? finalMrWrongs[0] : null;
    }

    return null;
}


const conversation = ["John:I'm in 1st position.",
    "Peter:I'm in 2nd position.",
    "Tom:I'm in 1st position.",
    "Peter:The man in front of me is Tom."]
console.log(findOutMrWrong(conversation));