export async function createWordsArray(settings) {

    // eslint-disable-next-line no-unused-vars
    const { wordsQuantity, addUpperCase, addNumbers, addSymbols } = settings
    let words = [] // result

    let localWords = JSON.parse(localStorage.getItem('errors')) // получаем из local storage сохраненные "ошибочные" слова
    if (localWords) {
        words = localWords.map( word => {
            return {
                val: word,
                wasError: true,
            }
        })
    }

    if (addNumbers) {
        // 10% от общего колическтва
        for (let i=0; i < wordsQuantity*0.1; i++) {
            words.push({
                val: randomInteger(10, 9999).toString() + ' '
            })
        }
    }
    // остальное добираем из wiki
    while (words.length < wordsQuantity) {
        let wordsFromWiki = await getWordsFromWiki();
        for (let wordW of wordsFromWiki) {
            wordW = wordW + ' ' // добавляем пробел
            if (!words.some(word => word.val.toLowerCase() === wordW)) {
                // если выбрана опция, с вероятностью 20% делаем первую букву заглавной
                if (addUpperCase && Math.random() < 0.20)  wordW = wordW[0].toUpperCase() + wordW.slice(1)
                words.push({
                    val: wordW ,
                })
                if (words.length == wordsQuantity) break
            }
        }
    }
    shuffle(words)

    return words
}

async function getWordsFromWiki() {
    // функция возвращает масссив из слов, полученных из случайной статьи на wikipedia

    let url = 'https://ru.wikipedia.org/api/rest_v1/page/random/summary';
    let response = await fetch(url);
    if (response.ok) {
        let result = await response.json();
        let text = result.extract
        let regexp = /(?<=^|\s)([а-яё-]{5,20})(?=\s|\.)/g // слова на кирилице от 5 до 20 символов
        let words = text.match(regexp)
        return words
    } else {
        alert("Ошибка HTTP: " + response.status);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomInteger(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}