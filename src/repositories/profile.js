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
    // Unfortunately sequelize goes wild with query like this one
    // return await Profile.findAll({
    //   limit: limit ?? 2,
    //   group: 'Profile.id',
    //   order: [sequelize.literal('sum(price) DESC')],
    //   include: [
    //     {
    //       model: Contract, as: 'Client', separate: true, include: [{
    //         model: Job, as: 'Jobs', where: {
    //           createdAt: {
    //             ...(startDate && {[Op.gte]: startDate.toISOString()}),
    //             ...(endDate && {[Op.lte]: endDate.toISOString()}),
    //           },
    //         },
    //       }],
    //     },
    //   ],
    // })
    // so here is sub-query based version, though it is error-prone, it is expected for the variables to be validated in advance
    const topClients = await Profile.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
            select sum(price) from Jobs
            where Jobs.ContractId in (
              select id from Contracts where
              Contracts.ClientId = Profile.id
            ) and createdAt between '${startDate.toISOString()}' and '${endDate.toISOString()}'
            and paid = 1
            )`),
            `pricesSum`,
          ],
        ],
      },
      limit: limit ?? 2,
      group: 'Profile.id',
      where: {type: 'client'},
      order: [[sequelize.literal('pricesSum'), 'DESC']],
    })
    return topClients.map(c => c.toJSON())

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