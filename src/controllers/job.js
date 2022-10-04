const {getProfile} = require('../middleware/getProfile')
const {sequelize} = require('../model')
const JobRepo = require('../repositories/job')
const ProfileRepo = require('../repositories/profile')

class JobController {
  async getUnpaidJobs(req, res) {
    const {id} = req.profile
    const jobs = await JobRepo.getUnpaidJobs(id)
    return res.json(jobs)
  }

  async payForJob(req, res) {
    await sequelize.transaction(async t => {
      const {id} = req.profile
      const {jobId} = req.params
      const job = await JobRepo.getJobById(jobId)
      if (!job) return res.sendStatus(404)
      if (job.Client.id !== id) return res.sendStatus(401)
      if (job.paid) return res.sendStatus(400)
      if (req.profile.balance < job.price) return res.sendStatus(403)
      const result = await JobRepo.markJobPaid(jobId)
      await ProfileRepo.updateBalance(id, req.profile.balance - job.price)
      await ProfileRepo.updateBalance(job.Contract.Contractor.id, job.Contract.Contractor.balance + job.price)
      return res.json(result)
    })
  }

}

module.exports = new JobController()