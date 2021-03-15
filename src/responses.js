const fs = require('fs');
const url = require('url');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const infoBank = {};

const wordBank = {};

// form response to send
const formResponse = (request, response, code, json) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(json));
  response.end();
};

// header response
const headResponse = (request, response, code) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end();
};

// index
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// css
const getStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// notfound
const getNotFound = (request, response) => {
  formResponse(request, response, 404, { id: 'Page Not Found', message: 'The requested resource was not found on the server (404)' });
};
const getNotFoundMeta = (request, response) => {
  headResponse(request, response, 404);
};

// gets facts w/out data
const retrieveFacts = () => {
  const results = {};
  for (let i = 0; i < Object.keys(infoBank).length; i++) {
    const entry = Object.entries(infoBank)[i];
    results[entry[0]] = {};
    results[entry[0]].name = entry[1].name;
    results[entry[0]].price = entry[1].price;
    results[entry[0]].GUID = entry[1].GUID;
  }
  return results;
};

const factMessage = (name) => ({ message: infoBank[name].fact });

// get facts
const getFacts = (request, response) => {
  formResponse(request, response, 200, retrieveFacts());
};
const getFactsMeta = (request, response) => {
  headResponse(request, response, 200);
};

// this needs to be better and the client should handle error 500s
const getFactData = (request, response) => {
  const { query } = url.parse(request.url, true);
  if (query.name) {
    return formResponse(request, response, 200, factMessage(query.name));
  }
  return formResponse(request, response, 200, { message: 'Cool dummy message! internal server error! kinda' });
};

// add words to list
const populateWords = (value) => {
  if (!wordBank[value]) {
    wordBank[value] = { count: 0 };
  }
  wordBank[value].count++;
};

// remove words
const decrementWords = (value) => {
  if (wordBank[value]) {
    wordBank[value].count--;
  }
};

// calcluate the worth of an array of words
const calculateCoins = (words) => {
  let total = 0;
  for (let i = 0; i < words.length; i++) {
    total += Object.keys(wordBank).length / wordBank[words[i]].count;
  }
  return total;
};

// update the price of all facts to account for new words, lets see if I can do this asynchronously
const updatePrices = () => {
  for (let i = 0; i < Object.keys(infoBank).length; i++) {
    const entry = Object.entries(infoBank)[i];
    // console.log(entry);
    entry[1].price = calculateCoins(entry[1].fact.split(' '));
  }
};

// add facts
const submitFact = (request, response, body) => {
  const jsonresponse = {
    message: 'Name and Fact are both required',
  };

  if (!body.name || !body.fact) {
    jsonresponse.id = 'missingParams';
    return formResponse(request, response, 400, jsonresponse);
  }
  // console.log(body);

  let responsecode = 201;

  // split into words
  const words = body.fact.split(' ');

  // add the fact
  if (infoBank[body.name]) {
    // update an existing fact
    responsecode = 204;
    const oldStatement = infoBank[body.name].fact.split(' ');
    oldStatement.forEach(decrementWords);
  } else {
    // create a new fact
    infoBank[body.name] = {};
    infoBank[body.name].name = body.name;
    infoBank[body.name].price = 0;
    infoBank[body.name].GUID = body.name.replace(' ', '');
  }
  infoBank[body.name].fact = body.fact;

  // populate wordBank
  words.forEach(populateWords);

  // update prices
  updatePrices();
  // console.log(infoBank);

  // calculate coin value of the words
  jsonresponse.coins = calculateCoins(words);

  if (responsecode === 201) {
    jsonresponse.message = 'Created Successfully!';
    return formResponse(request, response, responsecode, jsonresponse);
  }

  return headResponse(request, response, responsecode);
};

module.exports = {
  getIndex,
  getStyle,
  getNotFound,
  getNotFoundMeta,
  getFacts,
  getFactsMeta,
  submitFact,
  getFactData,
};
