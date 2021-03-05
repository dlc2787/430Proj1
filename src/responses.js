const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const users = {};

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

// get users
const getUsers = (request, response) => {
  formResponse(request, response, 200, { users });
};
const getUsersMeta = (request, response) => {
  headResponse(request, response, 200);
};

// add users
const addUser = (request, response, body) => {
  const jsonresponse = {
    message: 'Name and Age are both required',
  };

  if (!body.name || !body.age) {
    jsonresponse.id = 'missingParams';
    return formResponse(request, response, 400, jsonresponse);
  }
  console.log(body);

  let responsecode = 201;

  if (users[body.name]) {
    responsecode = 204;
  } else {
    users[body.name] = {};
    users[body.name].name = body.name;
  }

  users[body.name].age = body.age;

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
  getUsers,
  getUsersMeta,
  addUser,
};
