import database, models
from sqlalchemy import text
with database.engine.connect() as conn:
    res = conn.execute(text("SELECT id, job_id, scenario_prompt, hidden_prompt FROM assessments")).fetchall()
    for row in res:
        print(f"ID: {row[0]}, Job: {row[1]}, Hidden: {row[3]}")
        print(f"Prompt: {repr(row[2])}")
