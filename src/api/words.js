export async function createWordsArray(quantity = 100) {

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

    // остальное добираем из wiki
    while (words.length < quantity) {
        let wordsFromWiki = await getWordsFromWiki();
        for (let wordW of wordsFromWiki) {
            wordW = wordW + ' ' // добавляем пробел
            if (!words.some(word => word.val === wordW)) {
                words.push({
                    val: wordW ,
                })
                if (words.length === quantity) break
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