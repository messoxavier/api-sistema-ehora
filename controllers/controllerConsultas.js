const mysql = require('../mysql').pool;

////////////////////////////////////////////
// Marca uma consulta no Banco de dados    //
//////////////////////////////////////////
exports.inserirConsultas = (req, res, next) => {
    ///////////////////////////////////////////////
    //    Valida se a data do cadrastro Valida   //
    //////////////////////////////////////////////
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ erro: error }) }

        conn.query("SELECT * FROM consultas WHERE data = ? AND horario=?",
            [req.body.data, req.body.horario], (error, results) => {

                if (error) { return res.status(500).send({ error: error }) }

                /////////////////////////////////////////////////////////////
                // VERIFICA SE JA EXISTE USUÁRIO COM ESSE EMAIL CADASTRADO//
                ///////////////////////////////////////////////////////////
                if (results.length > 0) {
                    return res.status(409).send({ status: 409, mensagem: " Horario Indisponivel" })
                } else {

                    conn.query(
                        //////////////////////////////////////////////
                        // salva o Consulta no Banco de dados       //
                        ////////////////////////////////////////////
                        'INSERT INTO consultas (nome_usuario, data, horario,cpf) VALUES (?,?,?,?) ', [
                        req.body.nome_usuario, req.body.data, req.body.horario, req.body.cpf],
                        (error, results) => {
                            conn.release();
                            if (error) { return res.status(500).send({ erro: error }) }

                            const response = {
                                mensagem: "Consulta cadastrada com sucesso",
                                consulta: {
                                    id_consulta: results.insertId,
                                    nome_usuario: req.body.nome_usuario,
                                    cpf: req.body.cpf,
                                    data: req.body.data,
                                    horario: req.body.horario

                                }
                            }
                            return res.status(201).send({ status: 200, response })
                        })

                }
            })
    })


}
///////////////////////////////////////////
// Consulta e retorna todas as consultas//
// salvas no Banco de Dados            //
////////////////////////////////////////
exports.getconsultas = (req, res, next) => {

    mysql.query(
        'SELECT * FROM consultas ',
        ((error, results, field) => {

            if (error) { return res.status(500).send({ erro: error }); }

            const response = results.map((consulta) => {
                return {
                    id_consulta: consulta.id_tarefa,
                    Paciente: consulta.nome_usuario,
                    cpf: consulta.cpf,
                    data: consulta.data,
                    horario: consulta.horario

                }
            })

            res.status(200).send({ status: 200, consultas: response })

        })
    )
}

/////////////////////////////////////////
//    RETORNA CONSULTAS POR DATA      //
///////////////////////////////////////
exports.getconsultasdatas = (req, res, next) => {
    mysql.query(
        'SELECT * FROM consultas WHERE data = ?',
        [req.body.data],
        ((error, results, field) => {

            if (error) { return res.status(500).send({ erro: error }); }
            if (results.length == 0) {
                return res.status(404).send({
                    status: 404,
                    mensagem: "não foi encontrado nenhuma consulta nessa data"
                })
            }
            const response = results.map((consulta) => {
                return {
                    id_consulta: consulta.id_consulta,
                    Paciente: consulta.nome_usuario,
                    cpf: consulta.cpf,
                    data: consulta.data,
                    horario: consulta.horario

                }
            })

            // Função auxiliar para converter a string de data no formato brasileiro em um objeto de data
            const parseBrazilianDate = (dateString) => {
                const parts = dateString.split('/');
                const timeParts = parts[2].split(' ');
                const time = timeParts[1] || '00:00';
                const [hours, minutes] = time.split(':');
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Subtrai 1 do mês porque no JavaScript os meses são representados de 0 a 11
                const year = parseInt(timeParts[0]);

                return new Date(year, month, day, hours, minutes);
            };

            // Ordenar as consultas por data e hora
            response.sort((a, b) => parseBrazilianDate(a.data + ' ' + a.horario) - parseBrazilianDate(b.data + ' ' + b.horario));

            res.status(200).send({
                status: 200,
                consultas: response
            })

        })
    )
}

///////////////////////////////////////////
//    RETORNA CONSULTAS POR Usuario      //
//////////////////////////////////////////
exports.getconsultasusuario = (req, res, next) => {
    mysql.query(
        'SELECT * FROM consultas WHERE cpf = ?',
        [req.body.cpf],
        ((error, results, field) => {

            if (error) { return res.status(500).send({ erro: error }); }
            if (results.length == 0) {
                return res.status(404).send({
                    status: 404,
                    mensagem: "não foi encontrado nenhuma consulta desse Usuario"
                })
            }
            const response = results.map((consulta) => {
                return {
                    id_consulta: consulta.id_consulta,
                    Paciente: consulta.nome_usuario,
                    cpf: consulta.cpf,
                    data: consulta.data,
                    horario: consulta.horario

                }
            })
            const parseBrazilianDate = (dateString) => {
                const parts = dateString.split('/');
                const timeParts = parts[2].split(' ');
                const time = timeParts[1] || '00:00';
                const [hours, minutes] = time.split(':');
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Subtrai 1 do mês porque no JavaScript os meses são representados de 0 a 11
                const year = parseInt(timeParts[0]);

                return new Date(year, month, day, hours, minutes);
            };

            // Ordenar as consultas por data e hora
            response.sort((a, b) => parseBrazilianDate(a.data + ' ' + a.horario) - parseBrazilianDate(b.data + ' ' + b.horario));



            res.status(200).send({ status: 200, consultas: response })

        })
    )
}
//////////////////////////////////////////
// Retorna Array com as disponibilidade//
//           dos Horario livres       //
///////////////////////////////////////
exports.getconsultahorarios = (req, res, next) => {
    mysql.query(
        'SELECT * FROM consultas WHERE data = ?',
        [req.body.data],
        ((error, results, field) => {

            let listaHorarios = [
                { horario: "08:00", status: true },
                { horario: "08:30", status: true },
                { horario: "09:00", status: true },
                { horario: "09:30", status: true },
                { horario: "10:00", status: true },
                { horario: "10:30", status: true },
                { horario: "11:00", status: true },
                { horario: "11:30", status: true },
                { horario: "12:00", status: true },
                { horario: "12:30", status: true },
                { horario: "13:00", status: true },
                { horario: "13:30", status: true },
                { horario: "14:00", status: true },
                { horario: "14:30", status: true },
                { horario: "15:00", status: true },
                { horario: "15:30", status: true },
                { horario: "16:00", status: true },
                { horario: "16:30", status: true }

            ]

            if (error) {
                return res.status(500).send({
                    status: 500,
                    erro: error
                });
            }
            //////////////////////////////////////////////////////
            //        Retorna todos Horarios disponiveis       //
            ////////////////////////////////////////////////////
            if (results.length == 0) {
                return res.status(200).send({
                    status: 404,
                    mensagem: "Todos os horarios estão disponiveis para essa data",
                    horario: listaHorarios
                })
            }
            //////////////////////////////////////////////////////
            //verifica os horario já marcador e altera o status//
            //        para false do Array listaHorarios       //
            ///////////////////////////////////////////////////
            for (index = 0; index < results.length; index++) {
                for (index2 = 0; index2 < listaHorarios.length; index2++) {
                    if (listaHorarios[index2].horario == results[index].horario) {
                        listaHorarios[index2].status = false
                    }
                }

            }

            return res.status(200).send({
                status: 200,
                mensagem: "lista de Horarios disponiveis",
                horario: listaHorarios
            })

        })
    )
}

