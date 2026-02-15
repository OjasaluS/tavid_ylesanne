# Phone Number Validator

A simple web app where a user can enter a phone number and it gets validated via a PHP API. Uses Google's libphonenumber library for accurate international phone number validation.

## Run with Docker

```bash
docker compose up --build -d
```

Open http://localhost:8080

## Example Numbers

| Number | Valid |
|---|---|
| +372 5123 4567 | Estonian mobile |
| +371 21234567 | Latvia mobile |
| +44 7911 123456 | UK mobile |
| +49 170 1234567 | Germany mobile |
| +1 212 555 1234 | US number |
| +372 123 | Invalid - too short |
| +999 1234567 | Invalid country code |
| abc | Not a number |
