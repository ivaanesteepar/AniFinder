import json
import mysql.connector

def get_db_connection():
    with open('config.json', 'r') as f:
        config = json.load(f)

    return mysql.connector.connect(
        host=config['host'],
        user=config['user'],
        password=config['password'],
        database=config['database']
    )
