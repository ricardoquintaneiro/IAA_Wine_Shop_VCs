If in need of regenerating the circuit, follow these steps:

1. Install tools:
    ```bash
    npm install -g circom snarkjs
    ```

    Or if you prefer the updated Rust-based circom, follow the instructions at the [official circom installation guide](https://docs.circom.io/getting-started/installation/).

1. Clone circomlib:
    ```bash
    git clone https://github.com/iden3/circomlib.git
    ```

1. Compile the circuit:
    ```bash
    circom age_check.circom --r1cs --wasm --sym
    ```

1. Generate a Powers of Tau file:
    ```bash
    snarkjs powersoftau new bn128 12 pot12_0000.ptau
    snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
    snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau
    rm pot12_0*.ptau
    ```

1. Generate the zero-knowledge key:
    ```bash
    snarkjs groth16 setup age_check.r1cs pot12_final.ptau age_check_0000.zkey
    snarkjs zkey contribute age_check_0000.zkey age_check.zkey --name="First Contributor" -v
    snarkjs zkey export verificationkey age_check.zkey verification_key.json
    rm age_check_0*.zkey
    ```

1. Copy the generated files to the frontend:
    ```bash
    mkdir -p ../frontend/src/assets/
    cp age_check.r1cs age_check.sym age_check.zkey ../frontend/src/assets/
    cp -r age_check_js/* ../frontend/src/assets/
    ```