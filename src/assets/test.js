let aaa = 'Слово. '

let bbb = aaa.match(/[а-яё-]+/i)[0].toLowerCase()

console.log(`bbb: ${bbb}`);
console.log(`type: ${typeof bbb}`);