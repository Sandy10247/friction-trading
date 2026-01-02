# Project friction-trading

Personal Algo Trading Server

## Intro
- Strictly for Personal use. 
- Will be Public till I get a Go Lang Job, after that it will be Private 🔒 and in EC2 making Trades 🤑.

## MakeFile

Run build make command with tests
```bash
make all
```

Build the application
```bash
make build
```

Run the application
```bash
make run
```
Create DB container
```bash
make docker-run
```

Shutdown DB Container
```bash
make docker-down
```

DB Integrations Test:
```bash
make itest
```

Live reload the application:
```bash
make watch
```

Run the test suite:
```bash
make test
```

Clean up binary from the last build:
```bash
make clean
```
