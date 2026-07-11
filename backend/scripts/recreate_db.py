import models
import database
from sqlalchemy import text

print("Dropping schema public cascade...")
with database.engine.connect() as conn:
    conn.execution_options(isolation_level="AUTOCOMMIT")
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
print("Schema dropped and recreated.")

print("Creating all tables...")
models.Base.metadata.create_all(bind=database.engine)
print("Tables created successfully.")
