from database import engine
from sqlalchemy import text

def add_column(conn, table, column, type_def):
    try:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
        print(f"Added {column}")
    except Exception as e:
        print(f"Error adding {column}: {e}")

with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
    add_column(conn, "assessment_results", "score_response_quality", "FLOAT")
    add_column(conn, "assessment_results", "tab_switches", "INTEGER DEFAULT 0")
    add_column(conn, "assessment_results", "copy_paste_attempts", "INTEGER DEFAULT 0")
    add_column(conn, "assessment_results", "time_taken_seconds", "INTEGER DEFAULT 0")

print("Migration completed.")
