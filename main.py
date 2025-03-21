from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def helloWorld() :
    return {"message" : "Hello World"}