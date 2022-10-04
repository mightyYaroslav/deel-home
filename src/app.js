const express = require('express')
const bodyParser = require('body-parser')
const {sequelize} = require('./model')
const Sequelize = require('sequelize')
const {getProfile} = require('./middleware/getProfile')

const ContractController = require('./controllers/contract')
const JobController = require('./controllers/job')
const BalanceController = require('./controllers/balance')
const AdminController = require('./controllers/admin')
const {transactioned} = require('./middleware/transactioned')

const app = express()
app.use(bodyParser.json())

app.get('/contracts/:id', getProfile, ContractController.getContractById)
app.get('/contracts', getProfile, ContractController.getContractsForUser)

app.get('/jobs/unpaid', getProfile, JobController.getUnpaidJobs)
app.post('/jobs/:jobId/pay', getProfile, JobController.payForJob)

app.post('/balances/deposit/:userId', BalanceController.deposit)

app.get('/admin/best-profession', AdminController.getBestProfession)
app.get('/admin/best-clients', AdminController.getBestClients)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

module.exports = app
