// Unfortunately, could not make it work :sadfrog:

const {sequelize, namespace} = require('../model')
const transactioned = async (req, res, next) => {
  namespace.bindEmitter(req)
  namespace.bindEmitter(res)
  namespace.bind(next)
  namespace.run(async () => {

    try {
      await sequelize.transaction(t => {
        namespace.set('transaction', t);
        next()
      })
    } catch (e) {
      return res.sendStatus(500)
    }
  })
}
module.exports = {transactioned}