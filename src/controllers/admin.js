const ProfileRepo = require('../repositories/profile')

class AdminController {
  async getBestProfession(req, res) {
    const {start, end} = req.query
    const topContractors = await ProfileRepo.getTopContractors(new Date(start),new Date(end));
    const bestProfession = topContractors?.length > 0 ? topContractors[0].profession : null
    return res.json({bestProfession})
  }

  async getBestClients(req, res) {
    const {start, end, limit} = req.query
    const topClients = ProfileRepo.getTopClients(new Date(start), new Date(end), limit)
    return res.json(topClients)
  }

}

module.exports = new AdminController()