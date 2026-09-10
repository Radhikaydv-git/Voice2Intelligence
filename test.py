import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="callcenter_db",
    user="postgres",
    password="postgres123"
)

print("DB CONNECTION SUCCESS")
conn.close()
