import tasks, database
from sqlalchemy import text
with database.engine.connect() as conn:
    job = conn.execute(text("SELECT id FROM jobs ORDER BY id DESC LIMIT 1")).fetchone()
    if job:
        print(f"Latest job ID: {job[0]}")
        try:
            print("Running task...")
            res = tasks.generate_assessment_for_job(job[0])
            print("Result:", res)
        except Exception as e:
            import traceback
            traceback.print_exc()
    else:
        print("No jobs found")
