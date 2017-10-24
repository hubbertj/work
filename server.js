const path = require('path')
const express = require('express');
const app = express();

const publicPath = express.static(path.join(__dirname, 'dist'))
const indexPath = path.join(__dirname, 'dist/index.html')

app.set('port', (process.env.PORT || 5000))

app.use(publicPath)
app.get('/', function (_, res) { res.sendFile(indexPath) })

app.listen(app.get('port'), function() {
  console.log('App is running on port', app.get('port'))
})