from database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN title VARCHAR;"))
            print("Added title column")
        except Exception as e:
            print(f"Skipped title: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR;"))
            print("Added first_name column")
        except Exception as e:
            print(f"Skipped first_name: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN middle_name VARCHAR;"))
            print("Added middle_name column")
        except Exception as e:
            print(f"Skipped middle_name: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR;"))
            print("Added last_name column")
        except Exception as e:
            print(f"Skipped last_name: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN mobile_no VARCHAR;"))
            print("Added mobile_no column")
        except Exception as e:
            print(f"Skipped mobile_no: {e}")
            
        conn.commit()

if __name__ == "__main__":
    print("Updating database schema...")
    add_columns()
    print("Database schema updated.")
