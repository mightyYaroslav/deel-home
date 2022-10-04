const ContractRepo = require('../repositories/contract')
const ProfileRepo = require('../repositories/profile')

class ContractController {
  async getContractById(req, res) {
    const {id} = req.params
    const contract = await ContractRepo.findContractById(id)
    if (!contract) return res.sendStatus(404)
    else if (![contract.Contractor.id, contract.Client.id].includes(req.profile.id)) return res.sendStatus(403)
    return res.json(contract)
  }

  async getContractsForUser(req, res) {
    const {id} = req.profile
    const {asClient, asContractor} = await ProfileRepo.getContracts(id)
    return res.json({asClient, asContractor})
  }
}

module.exports = new ContractController()