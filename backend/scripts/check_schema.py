from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    print(conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='jobs'")).fetchall())
