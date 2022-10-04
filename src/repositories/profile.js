const {sequelize, Profile, Contract, Job} = require('../model')
const {Op} = require('sequelize')

class ProfileRepo {
  async updateBalance(id, balance) {
    return await Profile.update({balance}, {where: {id}})
  }

  async incrementBalance(id, diff) {
    await Profile.increment('balance', {by: diff, where: {id}})
  }

  async getTopContractors(startDate, endDate) {
    return await Profile.findAll({
      group: 'Profile.profession',
      order: [sequelize.literal('sum(price) DESC')],
      include: [
        {
          model: Contract, as: 'Contractor', required: true, include: [{
            model: Job, as: 'Jobs', required: true, where: {
              createdAt: {
                ...(startDate && {[Op.gte]: startDate.toISOString()}),
                ...(endDate && {[Op.lte]: endDate.toISOString()}),
              },
            },
          }],
        },
      ],
    })
  }

  async getTopClients(startDate, endDate, limit) {
    return await Profile.findAll({
      // limit: limit ?? 2, // TODO: Fix me
      group: 'Profile.id',
      order: [sequelize.literal('sum(price) DESC')],
      include: [
        {
          model: Contract, as: 'Client', separate: true, include: [{
            model: Job, as: 'Jobs', where: {
              createdAt: {
                ...(startDate && {[Op.gte]: startDate.toISOString()}),
                ...(endDate && {[Op.lte]: endDate.toISOString()}),
              },
            },
          }],
        },
      ],
    })
  }

  async getContracts(userId) {
    const profile = await Profile.findOne({
      where: {id: userId},
      include: [{
        model: Contract, as: 'Contractor',
        where: {
          status: {
            [Op.ne]: 'terminated',
          },
        },
        required: false,
      }, {
        model: Contract, as: 'Client',
        where: {
          status: {
            [Op.ne]: 'terminated',
          },
        },
        required: false,
      }],
    })
    return {
      asContractor: profile.Contractor ?? [],
      asClient: profile.Client ?? [],
    }
  }

}

module.exports = new ProfileRepo()