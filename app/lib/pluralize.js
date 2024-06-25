const customPluralizations = {
  'session': 'sessions'
}

export default function pluralize(word, count = 2, includeCount = false) {
  let result = ''
  if (includeCount) {
    result += `${count} `
  }
  if (count > 1)  {
    result += customPluralizations[word] || `${word}s`
  } else {
    result += word
  }
  return result
}