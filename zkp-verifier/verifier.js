const express = require('express');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const vkey = JSON.parse(fs.readFileSync(path.join(__dirname, 'verification_key.json')));

app.post('/verify-proof', async (req, res) => {
    try {
        const { proof, publicSignals } = req.body;
        const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
        res.json({ verified });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Verifier service running on port ${PORT}`);
});