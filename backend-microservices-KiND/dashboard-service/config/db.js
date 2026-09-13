const mongoose = require('mongoose');

// Three independent connections — NOT mongoose.connect() (which sets the
// single default connection). Each connection is fully separate so a
// problem with one database can't take down the others.
const authConn = mongoose.createConnection();
const productConn = mongoose.createConnection();
const orderConn = mongoose.createConnection();

async function connectAll() {
  await Promise.all([
    authConn.openUri(process.env.AUTH_MONGO_URI),
    productConn.openUri(process.env.PRODUCT_MONGO_URI),
    orderConn.openUri(process.env.ORDER_MONGO_URI),
  ]);
  console.log('[Dashboard] connected to auth, product, and order databases (read-only)');
}

module.exports = { authConn, productConn, orderConn, connectAll };
