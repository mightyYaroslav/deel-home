const {sequelize} = require('../model')
const JobsRepo = require('../repositories/job')
const ProfileRepo = require('../repositories/profile')

class BalancesController {
  async deposit(req, res) {
    await sequelize.transaction(async t => {
      const {userId} = req.params
      const {balance} = req.body
      const jobsPrice = await JobsRepo.sumJobsInProgress(userId)
      if (balance > Math.floor(0.25 * jobsPrice)) return res.sendStatus(403)
      await ProfileRepo.incrementBalance(userId, balance)
      return res.sendStatus(200)
    })
  }
}

module.exports = new BalancesController()