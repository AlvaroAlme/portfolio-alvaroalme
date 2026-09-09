require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

async function consultarFootballData(ruta) {
    const respuesta = await fetch(`https://api.football-data.org/v4${ruta}`, {
        headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
        },
    });

    if (!respuesta.ok) {
        const error = new Error(`Error al consultar la API externa: ${respuesta.statusText}`);
        error.status = respuesta.status;
        throw error;
    }

    return respuesta.json();
}

app.get('/api/tabla/:codigoLiga', async (req, res) => {
    const { codigoLiga } = req.params;

    try {
        const datos = await consultarFootballData(`/competitions/${codigoLiga}/standings`);
        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/partidos/:codigoLiga', async (req, res) => {
    const { codigoLiga } = req.params;

    try {
        const datos = await consultarFootballData(`/competitions/${codigoLiga}/matches`);
        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/equipo/:idEquipo', async (req, res) => {
    const { idEquipo } = req.params;

    try {
        const datos = await consultarFootballData(`/teams/${idEquipo}`);
        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
