import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "silverhands.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

email = 'kiruthikabalamurugan222@gmail.com'

cursor.execute("SELECT id, name FROM users WHERE email = ?", (email,))
user = cursor.fetchone()

if user:
    user_id = user[0]
    name = user[1]
    
    # Delete from user_skills
    cursor.execute("DELETE FROM user_skills WHERE user_id = ?", (user_id,))
    print(f"Deleted {cursor.rowcount} rows from user_skills")
    
    # Delete from notifications
    cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
    print(f"Deleted {cursor.rowcount} rows from notifications")
    
    # Delete from classes
    cursor.execute("DELETE FROM classes WHERE instructor = ?", (name,))
    print(f"Deleted {cursor.rowcount} rows from classes")
    
    # Delete from videos
    cursor.execute("DELETE FROM videos WHERE author = ?", (name,))
    print(f"Deleted {cursor.rowcount} rows from videos")
    
    # Delete the user
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    print(f"Deleted {cursor.rowcount} user(s)")
    
    conn.commit()
    print("Changes committed.")
else:
    print("User not found.")

conn.close()
