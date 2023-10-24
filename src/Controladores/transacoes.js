const pool = require('../conexao');
const jwt = require('jsonwebtoken');

const cadastraTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const {authorization} = req.headers;

    const token = authorization.split(' ')[1];

    const payload = jwt.decode(token);

    const params = [descricao, valor, data, categoria_id, payload.id, tipo];
try {
    if(tipo !== 'entrada' || tipo !== 'saida'){
        return res.status(400).json({mensagem: "O tipo precisa ser entrada ou saida apenas."})
    }
    const query = await pool.query('INSERT INTO transacoes(descricao, valor, data, categoria_id, usuario_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', params);
    return res.status(201).json(query.rows[0]);
} catch (error) {
    console.log(error.message);
    return res.status(500).json({mensagem: "Ocorreu um erro interno no servidor"})
}

}


const detalhaTransacao = async (req, res) => {
    const {id} = req.params;
    const {authorization} = req.headers;

    const payload = jwt.decode(authorization.split(' ')[1]);

try {
    const params = [Number(id), payload.id];
    const query = await pool.query('SELECT * FROM transacoes as t JOIN categorias ON t.categoria_id = categorias.id WHERE t.id = $1  AND usuario_id = $2', params)
    if(query.rowCount < 1) {
        return res.status(404).json({mensagem: "Transacao não encontrada"});
    }
    return res.status(200).json(query.rows[0]);
} catch (error) {
    console.log(error.message)
    return res.status(500).json({mensagem: "Ocorreu um erro interno no servidor"});
}
}

module.exports = {
    cadastraTransacao,
    detalhaTransacao
}