var seneca = require('seneca');
seneca( { host:'localhost', port:5050 } )
  .client()
  .act({generate: 'id', prequel: 'hi'}, function(err, result) {
      if (err) { throw new Error(err); }
      console.log("RESULT: ", result);
  })
