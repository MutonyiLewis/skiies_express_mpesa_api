require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const moment = require('moment')

const app = express();
const port = process.env.PORT 


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

app.get("/api", (req,res) => {
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


app.post("/stkpush", async (req, res) =>{

    const phone = "0708585994".substring(1)
    const amount = "1"

    res.json({phone, amount})

    //Timestamp
    const date = new Date();
    const timestamp = moment().format("YYYYMMDDHHmmss");

    // Shortcode, password and passkey
    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;
    const password = new Buffer.from(shortcode+passkey+timestamp).toString("base64");
  
})

