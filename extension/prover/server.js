const express = require('express');
const fs = require('fs');
const snarkjs = require('snarkjs');
const path = require('path');

const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

const wasmPath = path.join(__dirname, 'age_check_js/age_check.wasm');
const zkeyPath = path.join(__dirname, 'age_check.zkey');

const witnessCalculator = require('./age_check_js/witness_calculator.js');

app.post('/generate-proof', async (req, res) => {
  try {
    const input = req.body;

    // 1. Load WASM and ZKey
    const wasmBuffer = fs.readFileSync(wasmPath);
    const zkeyBuffer = fs.readFileSync(zkeyPath);

    // 2. Calculate witness
    const wc = await witnessCalculator(wasmBuffer);
    const witness = await wc.calculateWTNSBin(input, 0);

    // 3. Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, witness);

    res.json({ proof, publicSignals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proof service running on port ${PORT}`);
});