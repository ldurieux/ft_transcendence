# ft_transcendence




## Installation

```bash
  docker compose up --build
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file.
Rename the file env.example to .env to get started.

### Host

`WEB_HOST` localhost by default

`FRONT_PORT` 3000 by default

`API_PORT` 3001 by default

`JWT_SECRET` Json web tokens secret key

### Database

`POSTGRES_USER` database username

`POSTGRES_PASSWORD` database POSTGRES_PASSWORD

### Intra

`INTRA_ID` 

`INTRA_SECRET` 

You can get these by registering a new app in your [intra](https://profile.intra.42.fr/oauth/applications/).
