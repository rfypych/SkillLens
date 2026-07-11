from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE assessment_results ADD COLUMN replay_history TEXT;"))
            conn.commit()
            print("Added replay_history column.")
        except Exception as e:
            print(f"Error adding replay_history: {e}")

if __name__ == "__main__":
    migrate()
