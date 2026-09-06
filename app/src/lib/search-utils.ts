/**
 * Utilitários de busca tolerante do Manuauto.
 * Normalização de acentos, tokenização com stopwords do português
 * e pontuação por similaridade de bigramas (erro de digitação/plural).
 */
const ACCENTS=/[\u0300-\u036f]/g

export function normalizeText(input:string):string{
  return input.normalize('NFD').replace(ACCENTS,'').toLowerCase()
}

const STOPWORDS=new Set(['para','com','sem','que','qual','quais','onde','quando','como','porque','porquê','meu','minha','meus','minhas','seu','sua','seus','suas','este','esta','esse','essa','isso','aqui','esta','está','estão','são','ser','fica','ficam','deve','devo','pode','posso','fazer','troca','trocar','mudar','colocar','qual','tipo','certo','melhor'])
const BASE_STOPWORDS=new Set(['o','a','os','as','um','uma','uns','umas','de','do','da','dos','das','em','no','na','nos','nas','por','ao','aos','às','à','e','ou','mas','até','após','sobre','entre','the','of'])

export function tokenize(input:string):string[]{
  return normalizeText(input).replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(token=>token.length>2&&!BASE_STOPWORDS.has(token)&&!STOPWORDS.has(token))
}

function bigrams(word:string):Set<string>{
  const set=new Set<string>()
  for(let i=0;i<word.length-1;i+=1)set.add(word.slice(i,i+2))
  return set
}

/** Similaridade de Dice entre duas palavras (0 a 1). Tolerante a erro de digitação. */
export function wordSimilarity(a:string,b:string):number{
  if(a===b)return 1
  const A=bigrams(a),B=bigrams(b)
  if(!A.size||!B.size)return 0
  let common=0
  for(const gram of A)if(B.has(gram))common+=1
  return (2*common)/(A.size+B.size)
}

/**
 * Pontua um texto normalizado contra os tokens da pergunta.
 * Casamento exato vale 1; prefixo vale 0,85; similaridade de bigramas cobre erros.
 */
export function scoreText(tokens:string[],normalizedText:string):number{
  if(!tokens.length)return 0
  const words=normalizedText.split(/\s+/)
  let total=0
  for(const token of tokens){
    let best=0
    for(const word of words){
      if(word===token){best=1;break}
      if(word.startsWith(token)||token.startsWith(word)){best=Math.max(best,0.85)}
      else best=Math.max(best,wordSimilarity(token,word))
    }
    total+=best
  }
  return total/tokens.length
}

/** Pontuação de um trecho para a pergunta (usado no modo tolerante). */
export function fuzzyChunkScore(question:string,content:string):number{
  const tokens=tokenize(question)
  if(!tokens.length)return 0
  return scoreText(tokens,normalizeText(content))
}
