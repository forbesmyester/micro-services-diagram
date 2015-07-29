require('seneca')()
    .add({ generate:'id'}, function(msg, done) {
        p = '';
        if (msg.prequel) { p = msg.prequel + '-'; }
        done(null, {id: p + Math.random()})
    })
    .listen({ port: 8000 });
