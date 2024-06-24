import { parse } from 'yaml'
import { readFileSync } from 'fs'

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default function Loading() {
  let loadingMessage = sample(flavorText.loadingMessages)
  loadingMessage ||= "Loading..."
  
  return (<p>{loadingMessage}</p>)
}

const getData = async () => {

  const flavorText = parse(readFileSync('public/flavortext.yml', 'utf8'))

}