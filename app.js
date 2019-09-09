let express = require('express')
let app = express()
let ejs = require('ejs');
let paypal = require("paypal-rest-sdk")
require('dotenv').config()
app.set("view engine", "ejs");

var PaypalClientId = process.env.PaypalClientId;
var PaypalSecret = process.env.PaypalSecret;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': PaypalClientId,
    'client_secret': PaypalSecret
  });

app.get("/", (req, res)=>{
    res.render("index");
});

app.get("/complete", (req,res)=>{
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
      };
    
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get("/cancelled", (req,res)=>{
    res.end("Cancelled");
});


app.post("/pay", (req,res)=>{
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/complete",
            "cancel_url": "http://localhost:3000/cancelled"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Airplain",
                    "sku": "fs001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Airplan bought for testing."
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(var i = 0; i < payment.links.length; i++){
                if(payment.links[i].rel == "approval_url"){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})
app.listen(3000,(err)=>{
    if (err) {throw err}
    console.log("listening to port 3000");
})