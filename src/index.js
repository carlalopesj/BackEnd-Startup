import express from 'express';
import cors from 'cors';
import { db } from "../db.js";

const app = express();//criar app
app.use(express.json());
const port = 3535; // definir porta

app.use(cors()); //usar cors


//Retorna o paciente com base no código do paciente digitado na home
app.get('/pacientes', async (req, res) => {
  //Adicionando o nome da busca
  const { nome } = req.query;
  
  //Consulta apurada com o Where, passando o Id
  try {
    const result = await db.query('SELECT * FROM Paciente WHERE nome = $1', [nome]);
    
    if (result.rowCount > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Paciente não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ message: 'Erro ao buscar paciente' });
  }
  
});

//Cadastrar novo paciente
app.post('/addpaciente', async (req, res) => {
  try {
    const { nome, cpf, sexo, idade } = req.body; 
    
    // Verifica se todos os campos necessários estão presentes
    if (!nome || !cpf || !sexo || !idade ) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }
    
    const q = 'INSERT INTO Paciente (nome, cpf, sexo, idade) VALUES ($1, $2, $3, $4)';
    const values = [nome, cpf, sexo, idade];
    
    // Insere o paciente no banco de dados e retorna o paciente inserido
    const result = await db.query(q, values);
    
    res.status(200).json(result.rows[0]); // Retorna o paciente inserido
  } catch (err) {
    console.error('Erro ao cadastrar paciente:', err);
    res.status(500).json({ message: 'Erro ao cadastrar paciente.', err});
  }
});


//Mostra os dados da tabela da arcada_dentaria
app.get('/dentes', async (req, res) => {
    try {
      const { rows } = await db.query('SELECT * FROM Arcada_Dentaria');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  //Adiciona uma arcada dentária, com base nas notas dos dentes e no cod_paciente
  app.post('/adddentes', async (req, res) => {
    try {
      const { Avaliacao_arcada, fk_Paciente_Cod_Paciente, fk_Dente_Cod_dente } = req.body; //Recebe os dados
      if (!Avaliacao_arcada || !fk_Paciente_Cod_Paciente || !fk_Dente_Cod_dente) { //Caso estejam vazios
        return res.status(400).json({ message: 'Por favor, forneça todos os dados necessários.' });
      }
  
      // Separando as notas e ids dos dentes para inserção
      const notas = Avaliacao_arcada.split(',');
      const dentes = fk_Dente_Cod_dente.split(',');
  
      if (notas.length !== dentes.length) {
        return res.status(400).json({ message: 'Notas e dentes não correspondem.' });
      }
  
      // Inserindo cada dente individualmente por meio de um laço de repetição e seus index
      for (let i = 0; i < notas.length; i++) {
        const q = 'INSERT INTO Arcada_Dentaria (Avaliacao_arcada, fk_Paciente_Cod_Paciente, fk_Dente_Cod_dente) VALUES ($1, $2, $3)';
        const values = [notas[i], fk_Paciente_Cod_Paciente, dentes[i]];
        await db.query(q, values);
      }
  
      res.status(200).json({ message: 'Dados inseridos com sucesso.' });
    } catch (err) {
      console.error('Erro ao salvar os dados:', err);
      res.status(500).json({ message: 'Erro ao salvar os dados', err });
    }
  });

//Adiciona a média com base no cálculo realizado no FrontEnd de dentes, e no código do paciente
app.post('/addmedia', async (req, res) => {
    try {
        const { cod_paciente, media } = req.body;

        // Verifica se todos os campos necessários estão presentes
        if (!media || !cod_paciente) {
            return res.status(400).json({ message: 'Por favor, forneça o código e a média do paciente.' });
        }

        const q = 'INSERT INTO Media_paciente (media, fk_Paciente_Cod_Paciente ) VALUES ($1, $2)';
        const values = [media, cod_paciente];

        // Insere a média no banco de dados
        const result = await db.query(q, values);

        res.status(200).json(result.rows[0]); // Retorna a média inserida
    } catch (err) {
        console.error('Erro ao cadastrar média:', err);
        res.status(500).json({ message: 'Erro ao cadastrar média.', err});
    }
});

app.get('/media', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM Media_paciente');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Iniciar o servidor
app.listen(port,  () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
