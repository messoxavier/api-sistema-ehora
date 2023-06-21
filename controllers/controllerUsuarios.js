const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const { response } = require('express');
const jwt = require('jsonwebtoken');

///////////////////////////////
//    CADASTRA O USUÁRIO    //
/////////////////////////////
exports.cadastroUsuario = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ erro: error }) }

    conn.query("SELECT * FROM usuario WHERE cpf = ?", [req.body.cpf], (error, results) => {

      if (error) { return res.status(500).send({ error: error }) }

      /////////////////////////////////////////////////////////////
      // VERIFICA SE JA EXISTE USUÁRIO COM ESSE EMAIL CADASTRADO//
      ///////////////////////////////////////////////////////////
      if (results.length > 0) {
        return res.status(409).send({ status: 409, mensagem: " CPF já cadastrado" })
      } else {
        /////////////////////////////////////////////////////////////
        //                VERIFICA SE CPF É VALIDO                //
        ///////////////////////////////////////////////////////////
        if (req.body.cpf.length != 11) {
          return res.status(500).send({ status: 500, mensagem: "Cpf invalido!" })
        }
        ////////////////////////////////////////////////////////////
        //bcrypt(responsavel por criptografar a senha do usuário)//
        //que será salva no banco de dados                      //
        /////////////////////////////////////////////////////////
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
          if (errBcrypt) { res.status(500).send({ erro: errBcrypt }) }

          conn.query(
            //////////////////////////////////////////////
            // salva o Usuário no Banco de dados       //
            ////////////////////////////////////////////
            'INSERT INTO usuario (nome_usuario, senha, cpf, email) VALUES (?,?,?,?) ', [
            req.body.nome_usuario, hash, req.body.cpf, req.body.email],
            (error, results) => {
              conn.release();
              if (error) { return res.status(500).send({ erro: error }) }

              const response = {
                mensagem: "Usuário Cadastrado com sucesso",
                usuarioCriado: {
                  id_usuario: results.insertId,
                  nome_usuario: req.body.nome_usuario,
                  CPF: req.body.cpf
                }
              }
              return res.status(201).send(response)
            })
        })
      }
    })
  })
}


/////////////////////////////////////
// FAzer Login do Usuario         //
///////////////////////////////////
exports.loginUsuario = (req, res, next) => {

  mysql.getConnection((error, conn) => {
    if (error) { return res.status(500).send({ erro: error }) }

    const query = 'SELECT * FROM usuario where cpf = ?'

    conn.query(query, [req.body.cpf], (error, results, fields) => {
      conn.release();

      if (error) { return res.status(500).send({ erro: error }) }
      ////////////////////////////////////////////////////
      //Verifica se o usuario existe  no Banco de Dados//
      ///////////////////////////////////////////////////
      if (results.length < 1) {
        return res.status(401).send({ mensagem: "Falha na autenticação" })
      }
      /////////////////////////////////////////////////////
      // valida a senha comparando com a que está salva //
      // no banco de dados                             //
      ////////////////////////////////////////////////// 

      bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
        ////////////////////
        //se houve error//
        //////////////////
        if (error) {
          return res.status(401).send({ mensagem: 'Falha na autenticação ' })
        }
        /////////////////////////////////////////////
        // retorna um token para atenticação,     //
        // caso seja validado os dados do usuario//
        //////////////////////////////////////////
        if (result) {
          let token = jwt.sign({
            id_usuario: results[0].id_usuario,
            nome_usuario: results[0].nome_usuario
          }, process.env.JWT_KEY, {
            expiresIn: "30m"
          })
          return res.status(200).send({
            mensagem: 'Autenticado com sucesso',
            token: token,
            usuario: {
              id: results[0].id_usuario,
              nome: results[0].nome_usuario,
              cpf:results[0].cpf,
              email: results[0].email
            }
          })
        }
        //////////////////////////////////////////////
        //caso não entre em nenhum dos testes acima//
        ////////////////////////////////////////////
        return res.status(401).send({ mensagem: 'Falha na autenticação ' })

      })


    })

  })

}

/* exports.atualizarUsuario =  (req, res, next)=>{
  return res.status(200).send({mensagem:'Rota atualizar usuario'});
}

exports.deleteUsuario =  (req, res, next)=>{
  return res.status(200).send({mensagem:'Rota Delete usuario'});
} */


