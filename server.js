const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('superagent');
require('dotenv').config()

const app = express();

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

//Here we're setting the view directory to be ./views
//thereby letting the app know where to find the template files
app.set('views', './views');

//Defult engine to be ejs
// note we don't need to require it, express does for us
app.set('view engine', 'ejs');

//res.render instead of res.send to send output of template by filename
app.get('/', (req, res) => {
    const data = {
        person: {
            firstName: 'Tony',
            lastName: 'Silva'
        }
    }
    //Now data is the second argument passed to template render method, data being the local variable above
    res.render('index', data);
});

app.get('*', function (req, res) {
    res.send(404,'Whoops, page not found 404');
  })

const mailchimpInstance = 'us7';
const listUniqueId = process.env.LIST_UNIQUE_ID;
const API_KEY = process.env.MAILCHIMP_API_KEY;
app.post('/thanks', (req, res) => {
    request
        .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + API_KEY ).toString('base64'))
        .send({
          'email_address': req.body.email,
          'status': 'subscribed',
          'merge_fields': {
            'FNAME': req.body.firstName,
            'LNAME': req.body.lastName
          },
          'PHONE': req.body.phoneNumber,
          'MESSAGE': req.body.message
        })
        .end(function(err, response) {
            if(response.status < 300 || (response.status === 400)) {
                res.render('thanks', { contact: req.body })
            } else {
                console.log(err);
                res.send('Sign Up Failed :(');
            }
        }) 
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});