import 'dotenv/config'
import axios from 'axios'
import Mailgun from 'mailgun.js'
import formData from 'form-data'
import fs from 'fs'

console.log('Web checker has started', new Date().toUTCString())

let retryCount = 0
const cooldown = 60 * 1000

function sendMail(message) {
    try {
        const mailgun = new Mailgun(formData)
        const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY})
        const data = {
            from: 'Web Checker Template<web-checker-template@example.com>',
            to: process.env.SEND_EMAIL_TO,
            subject: 'Test Subject',
            text: message
        }
        mg.messages.create(process.env.MAILGUN_DOMAIN, data)
            .then(msg => {
                console.log('Email is send', new Date().toUTCString())
                console.log(msg)
            })
    } catch (err) {
        console.log(err)
    }
}

function sendLogMail(message) {
    try {
        const mailgun = new Mailgun(formData)
        const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY})
        const data = {
            from: 'Web Checker Template<web-checker-template@example.com>',
            to: process.env.SEND_EMAIL_TO,
            subject: 'Web Checker Template - logs',
            text: 'Logs from the app:\n\n' + message
        }
        mg.messages.create(process.env.MAILGUN_DOMAIN, data)
            .then(msg => {
                console.log('Log email is send', new Date().toUTCString())
                console.log(msg)
            })
    } catch (err) {
        console.log(err)
    }
}

function sendLog({ force = false } = {}) {
    const currentDate = new Date().getDate()
    if (force || (currentDate === 1 || currentDate === 15)) { // Only forced or twice a month
        let logs = ''
        try {
            logs = fs.readFileSync('./logs/logs.txt', 'utf8')
        } catch (err) {
            console.log(err)
            logs = err.message
        }
        sendLogMail(logs)
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function App() {
    try {
        const response = await axios.get(process.env.URL)
        if(response.status < 200 || response.status > 299) {
            throw new Error('No valid response returned!', response)
        }
        const { data } = response

        // TODO: Implement your custom logic for the response
        if (data) {
            console.log('Will send email')
            const message = `Response has the data we need`
            sendMail(message)
        } else {
            console.log("Response does not have the data we need")
        }
        sendLog()
    } catch(e) {
        if(e.response.status === 429 && retryCount < 5) {
            console.log('Too many requests! Will retry after ' + cooldown / 1000 + 's. Retry attempt:', retryCount)
            retryCount += 1
            await sleep(cooldown)
            await App()
        } else {
            console.log('Something went wrong!\n\n', e.message)
            sendLog({force: true})
        }
    }
}

App()
