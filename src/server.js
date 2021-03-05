const http = require('http');
const url = require('url');
const query = require('querystring');
const responses = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlPair = {
  GET: {
    '/': responses.getIndex,
    '/style.css': responses.getStyle,
    '/getUsers': responses.getUsers,
    '/notReal': responses.getNotFound,
    notFound: responses.getNotFound,
  },
  HEAD: {
    '/getUsers': responses.getUsersMeta,
    '/notReal': responses.getNotFoundMeta,
  },
};

const handleGet = (request, response, parsedURL) => {
  if (urlPair[request.method][parsedURL.pathname]) {
    urlPair[request.method][parsedURL.pathname](request, response);
  } else {
    urlPair.GET.notFound(request, response);
  }
};

const handlePost = (request, response, parsedURL) => {
  if (parsedURL.pathname === '/addUser') {
    const body = [];
    // handle errors
    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    // load data chunks
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodystring = Buffer.concat(body).toString();
      const queryparams = query.parse(bodystring);

      responses.addUser(request, response, queryparams);
    });
  }
};

const onReq = (request, response) => {
  console.log(request.url);
  const parsedURL = url.parse(request.url);
  if (request.method === 'POST') {
    handlePost(request, response, parsedURL);
  } else {
    handleGet(request, response, parsedURL);
  }
};

http.createServer(onReq).listen(port);
console.log(`Listening on 127.0.0.1:${port}`);
