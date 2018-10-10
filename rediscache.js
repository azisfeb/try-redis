require('dotenv').config()
const express = require('express')
const app     = express()
const fetch   = require('node-fetch')
const redis = require('redis')

const apikey = process.env.DATAGOVAPIKEY

let client = redis.createClient()

client.on("connect", () => {
    console.log('Redis client connected')
})

app.get('/schools', (req, res) => {
    let terms = req.query.name

    client.get('/schools/'+ terms, (err, result) => {
        if(result != null){
            console.log(`Cache hit for: ${terms}`)
            res.send(result)
        } else {
            console.log(`Missed cache for ${terms}`)
            fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${apikey}&school.name=${terms}&fields=school.name,location.lon,location.lat&per_page=100`)
            .then((res) => res.json())
            .then(json => {
                client.setex('/schools/'+terms, 300, JSON.stringify(json))
                res.send(json)
            })
            .catch(e => {
                console.error(e)
                res.send(202)
            })
        }
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server now is running ...')
})