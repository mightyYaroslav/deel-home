const {Job, Contract, Profile} = require('../model')
const {Op} = require('sequelize')

class JobRepo {
  async getUnpaidJobs(userId) {
    return await Job.findAll({
      where: {paid: false},
      include: [
        {
          model: Contract,
          where: {
            status: 'in_progress',
            [Op.or]: {
              '$Contract.Contractor.id$': userId,
              '$Contract.Client.id$': userId,
            },
          },
          include: [
            {model: Profile, as: 'Contractor'},
            {model: Profile, as: 'Client'},
          ],
        },
      ],
    })
  }

  async getJobById(id) {
    return await Job.findOne({
      where: {id: id}, include: [
        {
          model: Contract,
          where: {status: 'in_progress'},
          include: [
            {model: Profile, as: 'Client'},
            {model: Profile, as: 'Contractor'},
          ],
        },
      ],
    })
  }

  async markJobPaid(jobId) {
    return await Job.update({paid: true}, {where: {id: jobId}}, {returning: '*'});
  }

  async sumJobsInProgress(userId) {
    let jobsPrice = await Job.sum('price', {
      where: {paid: false},
      include: [
        {
          model: Contract,
          where: {status: 'in_progress'},
          include: [
            {model: Profile, as: 'Client', where: {id: userId}},
          ],
        },
      ],
    })
    jobsPrice ??= 0
    return jobsPrice
  }

}

module.exports = new JobRepo()