# IAA_Wine_Shop_VCs

This is a university project for the course of Identification, Authentication and Authorization, of the Masters program in Cybersecurity of University of Aveiro. The goal is to create a Proof-of-Concept (PoC) to demonstrate **Privacy Preserving Authentication with Verifiable Credentials** in a practical setting.

## Project Overview

IAA_Wine_Shop_VCs is an online wine shop demo that showcases two major privacy-preserving features using modern cryptography:

- **Legal Age Proving:**  
  Users can prove they are of legal drinking age using a Zero-Knowledge Proof (ZKP) without revealing their actual birthdate or any unnecessary personal information.

- **Product Authenticity Verification:**  
  Customers can verify the authenticity of wine products using Verifiable Credentials (VCs) and Verifiable Presentations (VPs), making sure the wine's origin and certifications are genuine.

The project includes a web shop, a browser extension (VC Wallet), a ZKP prover and verifier, and many other supporting backend services.

## Running the Project

The easiest way to run most of the system is with **Docker Compose**. Most of the other components are pre-built in advance.

```sh
docker compose up --build
```

**VC Wallet Extension:**
    - Load the extension from `extension/frontend` after running "npm run build" in that directory.

## Notes

- This project is for demonstration and educational purposes only. There is a .env exposed. Do not use it in production. Also, there are, without a doubt, security vulnerabilities.