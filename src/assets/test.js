let aaa = [
    {
        item: 'aaa',
        isError: false
    },
    {
        item: 'bbb',
        isError: true
    }
]

let bbb = aaa[1]
bbb.newProp = 'ttt'
bbb.isError = false

console.log(`bbb: ${JSON.stringify(bbb)}`);
console.log(`aaa[1]: ${JSON.stringify(aaa[1])}`);