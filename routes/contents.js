var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/readme', function(req, res, next){
    fs.readFile(path.join(__dirname, '../', 'content', 'README-template.md'), function(err, data){
        if(err){
            return next(err);
        }
        base64 = new Buffer(data).toString('base64');
        return res.send(base64);
    });
});

module.exports = router;