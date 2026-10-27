import argparse
import sys
from database import SessionLocal
import models
from security import hash_password


def create_security_user(email: str, name: str, password: str):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            print(f"Error: User with email '{email}' already exists with role '{existing.role}'.")
            sys.exit(1)

        # Create security staff user
        hashed_pwd = hash_password(password)
        security_user = models.User(
            email=email,
            full_name=name,
            hashed_password=hashed_pwd,
            role="security",
        )
        db.add(security_user)
        db.commit()
        db.refresh(security_user)
        print(f"Success: Security user '{security_user.email}' (ID: {security_user.id}) created successfully with role 'security'.")
    except Exception as e:
        db.rollback()
        print(f"Database error creating security user: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a security user directly in the database.")
    parser.add_argument("--email", required=True, help="Security user email address")
    parser.add_argument("--name", required=True, help="Security user full name")
    parser.add_argument("--password", required=True, help="Security user plaintext password")

    args = parser.parse_args()
    create_security_user(email=args.email, name=args.name, password=args.password)
