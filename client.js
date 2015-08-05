var seneca = require('seneca');
seneca()
  .client( { host:'localhost', port:5050 } )
  .act({generate: 'id', prequel: 'hi'}, function(err, result) {
      if (err) { throw new Error(err); }
      console.log("RESULT: ", result);
  })
