import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

new_password = "mike"
hashed_password = hash_password(new_password)
print(f"Hashed Password: {hashed_password}")
