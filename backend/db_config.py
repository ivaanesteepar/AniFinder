import os
import mysql.connector
from dotenv import load_dotenv

# Solo carga el .env si existe
#base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#dotenv_path = os.path.join(base_dir, '.env')

#load_dotenv(dotenv_path)

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'anifinder')
    )
