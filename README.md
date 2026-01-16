# Musterlösung myApp

Zeigt auf was so alles möglich wäre ;-).

## Abhängigkeiten welche installiert wurden

### configuration

```bash
npm i --save @nestjs/config dotenv
```

### swagger

```bash
npm i --save @nestjs/swagger
```

### datenbank

Wir unterstützen SQLite und PostgreSQL.

```bash
npm i --save @nestjs/typeorm typeorm sqlite3 pg
```

### validation

```bash
npm i --save class-validator class-transformer @nestjs/mapped-types

# spezielle library für die Validierung des .env-Files (optional)
npm i --save zod
```

### security

```bash
npm i --save argon2
```

### JWToken

```bash
npm i --save @nestjs/jwt
```

### yaml support

brauchen wir nur wenn wir z.b. docs-yaml unterstützen möchten

```bash
 pnpm i --save yaml
```

### alles zusammen

```bash
npm i --save @nestjs/config dotenv @nestjs/swagger @nestjs/typeorm typeorm sqlite3 pg class-validator class-transformer @nestjs/mapped-types zod argon2 @nestjs/jwt 
```

## Entwicklungsabhängigkeiten

### compodoc

```bash
# wenn wir das einbauen, bitte auch im tsconfig.build.json dieses Verzeichnis mit exclude ignorieren!
npm i --save-dev @compodoc/compodoc

# wenn wir generieren der readmes möchten
npm i -D ts-morph fast-glob

npm i -D mermaid
npm i -D @mermaid-js/mermaid-cli
```

> windows

```powershell
winget install pandoc
```

> macOS

```bash
brew install pandoc
```

> linux

```bash
sudo apt update
sudo apt install pandoc
sudo apt install texlive-xetex
sudo apt install librsvg2-bin
```

## test result

Die aktuelle Lösung hat eine 100-%-Testabdeckung für services mit Unit-Tests.
