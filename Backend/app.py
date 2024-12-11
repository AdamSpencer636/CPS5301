from flask import Flask, request, jsonify
import json
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from database import Database_Query

app = Flask(__name__)
CORS(app)

#Database Connection
uri = "mongodb+srv://spencead:qcX1hb2i0ptlItEJ@cluster0.zzu60.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

@app.route("/test")
def test():
    print("pinged")
    return "hi"

@app.route("/database/find", methods=['GET', 'POST']) 
def databaseFind():
    query = request.json
    result = Database_Query("find", query, client)
    return json.dumps(result, default=str)


@app.route("/database/insert") 
def databaseInsert():
    query = request.json
    return Database_Query("insert", query, client)


@app.route("/database/update") 
def databaseUpdate():
    query = request.json
    return Database_Query("update", query, client)