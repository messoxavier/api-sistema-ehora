const express = require('express')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotasUsuario = require('./routes/usuarios')
const rotaConsultas = require('./routes/consultas')




app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/////////////
//  CORS  //
////////////
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
    next();
})



///////////////////
//     ROTAS    //
/////////////////
app.get('/lista', (req, res, next) => {
    res.status(200).send({ mensagem: "conectado" })
});

app.use('/usuario', rotasUsuario);
app.use('/consultas', rotaConsultas);

//////////////////////
// ROTAS DE  ERROS //
////////////////////

app.use((req, res, next) => {
    const erro = new Error('Não encontrado')
    erro.status = 404;
    next(erro)
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        erro: {
            mensagem: error.mensagem
        }
    })
})




module.exports = app;