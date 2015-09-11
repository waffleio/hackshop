var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

router.get('/readme', function(req, res, next){
    fs.readFile(path.join(__dirname, '../', 'content', 'README-template.md'), function(err, data){
        if(err){
            return next(err);
        }
        base64 = new Buffer(data).toString('base64');
        return res.send(base64);
    });
});

router.get('/cards', function(req, res, next){

   fs.readFile(path.join(__dirname, '../', 'content', 'cards.json'), 'utf8', function(err, data){
        if(err){
            return next(err);
        }

        cardsMetadata = JSON.parse(data);

        cards = _.map(cardsMetadata, function(metadata){
            return {
                title: metadata.title,
                labels: metadata.labels,
                description: fs.readFileSync(path.join(__dirname, '../', 'content', 'cards', metadata.file), 'utf8')
            }
        });

        return res.json(cards);
    }); 
});

module.exports = router;