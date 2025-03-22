# Project Setup Instructions

## Prerequisites
- **Git**: [Download & Install](https://git-scm.com/)
- **Python 3.12.6**: [Download & Install](https://www.python.org/downloads/release/python-3126/)
Instal postgresl only if database is necessary. Easier configuration with docker explained below.
- **PostgreSQL**: [Download & Install](https://www.postgresql.org/download/)

## Download & Install Docker
[Download Link](https://docs.docker.com/desktop/setup/install/windows-install/)
**Preferrably use WSL when installing**

## Installing & Running Postgres
**First Time Install**
1. Pull the postgres container by running `docker pull postgres`
2. Run using `docker run --name finsage_db -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=finsage -p 5432:5432 -d postgres`

**Running the container**
If the container is stopped, first ensure Docker Desktop is running
Then execute `docker start finsage_db`

**Stopping the container**
After developing stop the container using `docker stop finsage_db`

## Clone the Repository
```sh
git clone <REPO_URL>
cd <PROJECT_FOLDER>
```

## Create a Virtual Environment
```sh
python -m venv venv
```

### Activate the Virtual Environment:
- **Windows**:
  ```sh
  venv\Scripts\activate
  ```
- **Mac/Linux**:
  ```sh
  source venv/bin/activate
  ```

## Install Dependencies
```sh
pip install --upgrade pip
pip install -r requirements.txt
```

## Start PostgreSQL Database
**Follow This Step Only IF You Want Postgres Running**
Ensure PostgreSQL is running. If using Docker:
```sh
docker run --name finsage_db -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=finsage -p 5432:5432 -d postgres
```

## Setup environment variables
Create a .env file and paste this 
```sh
DATABASE_URL=postgresql://dev:devpass@localhost:5432/finsage
SECRET_KEY=meow
```

**Note : Only if you have PSQL installed manually instead of Docker**
If PostgreSQL is installed directly on your system, create the database manually:
```sh
psql -U dev -c "CREATE DATABASE finsage;"
```

## Run FastAPI Server
```sh
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will now be running at: **http://127.0.0.1:8000**

