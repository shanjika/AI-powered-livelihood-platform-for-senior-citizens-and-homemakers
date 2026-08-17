import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "silverhands.db")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

email = 'kiruthikabalamurugan222@gmail.com'

cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
user = cursor.fetchone()

if user:
    print(f"User found: ID={user['id']}, Name={user['name']}")
    user_id = user['id']
    name = user['name']
    
    # Check user_skills
    cursor.execute("SELECT count(*) FROM user_skills WHERE user_id = ?", (user_id,))
    print(f"Skills count: {cursor.fetchone()[0]}")
    
    # Check notifications
    cursor.execute("SELECT count(*) FROM notifications WHERE user_id = ?", (user_id,))
    print(f"Notifications count: {cursor.fetchone()[0]}")
    
    # Check classes
    cursor.execute("SELECT count(*) FROM classes WHERE instructor = ?", (name,))
    print(f"Classes count: {cursor.fetchone()[0]}")
    
    # Check videos
    cursor.execute("SELECT count(*) FROM videos WHERE author = ?", (name,))
    print(f"Videos count: {cursor.fetchone()[0]}")
else:
    print("User not found.")

conn.close()
