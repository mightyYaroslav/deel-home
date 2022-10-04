const {Contract, Profile} = require('../model')

class ContractRepo {
  async findContractById(id) {
    return await Contract.findOne({
      where: {id},
      include: [{model: Profile, as: 'Contractor'}, {model: Profile, as: 'Client'}],
    })
  }
}

module.exports = new ContractRepo()