import mysql.connector

try:
    # Attempt to establish the connection
    db_connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="saikumar@4681P",
        database="vehicle_available_calender"
    )
    
    if db_connection.is_connected():
        print("Successfully connected to the MySQL database!")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    if 'db_connection' in locals() and db_connection.is_connected():
        db_connection.close()
        print("MySQL connection is closed.")