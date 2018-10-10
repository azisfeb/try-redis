require('dotenv').config()
const express = require('express')
const app     = express()
const fetch   = require('node-fetch')

const apikey = process.env.DATAGOVAPIKEY

let cache = {}

app.get('/schools', (req, res) => {
    let terms = req.query.name
    let result = cache[terms]

    if(result != null){
        console.log(`Cache hit for: ${terms}`)
        res.send(result)
    } else {
        console.log(`Missed cache for ${terms}`)
        fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${apikey}&school.name=${terms}&fields=school.name,location.lon,location.lat&per_page=100`)
        .then((res) => res.json())
        .then(json => {
            cache[terms] = json
            res.send(json)
        })
        .catch(e => {
            console.error(e)
            res.send(202)
        })
    }

})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server now is running ...')
})