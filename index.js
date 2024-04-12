require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const moment = require('moment')

const app = express();
const bodyParser =  require('body-parser');
const http = require('http')
const request = require('request')

const port = process.env.PORT 


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

app.get("/", (req,res) => {
    res.send(`<h1>Hello this MutonyiLewis</h1>`);
    const timestamp = moment().format("YYYYMMDDHHmmss");
    console.log(timestamp)
});

app.get("/token", (req,res) => {
    generateToken()
    .then((accessToken) => {
        res.json({message: "Access token is " + accessToken})
    })
    .catch(console.log)
})

//Generate access token
const generateToken = async() => {
    const secret = process.env.MPESA_SECRET_KEY
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

        const auth = 
        "Basic " +
        new Buffer.from(`${consumerKey}:${secret}`).toString("base64");
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: auth, 
            },
        })
        const dataresponse = response.data;
        const accessToken = dataresponse.access_token;
        return accessToken;
    } catch(error){
        throw error
    }
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Mpesa STK push route
app.get("/stkpush", (req, res) => {
    generateToken()
      .then((accessToken) => {
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        auth = "Bearer " + accessToken
        var timestamp = moment().format("YYYYMMDDHHmmss")
        const password = new Buffer.from(
            "174379" +
            "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
            timestamp
         ).toString("base64");

         request(
            {
                url: url, 
                method: "POST",
                headers: {
                    Authorization: auth,
                },
                json: {    
                    "BusinessShortCode": "174379",    
                    "Password": password,    
                    "Timestamp":timestamp,    
                    "TransactionType": "CustomerPayBillOnline",    
                    "Amount": "1",    
                    "PartyA":"254708585994",    
                    "PartyB":"174379",    
                    "PhoneNumber":"254708585994",    
                    "CallBackURL": "https://mydomain.com/path",    
                    "AccountReference":"Test",    
                    "TransactionDesc":"Test"
                 },
            },
            function (error, response, body){
                if(error) {
                    console.log(error)
                } else {
                    console.log(
                        "Request was successful. Please enter pin to complete transaction"
                    )
                    res.status(200).json(body);
                }
            }
         )
      })
      .catch(console.log)
})

//Register URL for C2B

app.get("/registerurl", (req, res) => {
    generateToken()
       .then((accessToken) => {
        let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
        let auth = "Bearer " + accessToken

        request(
            {
                url: url,
                method:"POST",
                headers: {
                    Authorization: auth
                },
                json: 
                {    
                    "ShortCode": "174379",
                    "ResponseType":"[Cancelled/Completed]",
                    "ConfirmationURL":"http://example.com/confirmation",
                    "ValidationURL":"http://example.com/validation"
                },
            },
            function (error, response, body){
                if(error){
                    console.log(error)
                }else{
                    res.status(200).json(body)
                }
            }
        )
       }).catch(err=>console.log(err))
})

app.post("/confirmation", (req, res) => {

})


// Business to Customer
app.get("/requestfunds", (req, res) => {
    generateToken()
      .then((accessToken) => {
        const securityCredential = "Ngs0nG0LVvqbWvfaOPL6moTzOKhJ7N0WKcTL5NPGEcjYdKAIpeKkryFPnuLpcH2Wa6LCuf284TI+c1+yknfswPpapaRObU9dk3i1HfWkc3Bh+cfEGX6D78rUqB/2Rvxo8eD3plt8nykPeEP1HS3N8b+03agmT2vKd1j0w9hFPeZr1YsIv+gF+F78zHmFSAZChkiI96Hy5TrLEKC6Cyot4cD75cP+hZDk3BaUYA1xPcItJHVJCDERy2SCVWLqaMIikRftU0I2fGPEJzLp3dM7md7Cw3hlJQ0Bk4WiNIIxQPmNq7P9rdMw7LdGs1KWGzdi4Akp1wDlYTh7odQMzbTgZQ=="
        const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
          auth = "Bearer " + accessToken

          request({
            url: url,
            method: "POST",

            headers: {
                Authorization: auth
            },

            json: {    
                "OriginatorConversationID": "f8d188ea6-dc5f-4127-aaae-981ccf4d9b4d",
                "InitiatorName": "testapi",
                "SecurityCredential": securityCredential,
                "CommandID":"BusinessPayment",
                "Amount":"100",
                "PartyA":"600996",
                "PartyB":"254708585994",
                "Remarks":"Testing remarks",
                "QueueTimeOutURL":"https://mydomain.com/b2c/queue",
                "ResultURL":"https://mydomain.com/b2c/result",
                "Occassion":"Christmas"
             },
          },
          function(error, response, body){
            if(error){
                console.log(error)
            }else{
                res.status(200).json(body)
            }
          }
        )
      }).catch(console.log)
})