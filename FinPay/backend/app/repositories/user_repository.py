from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def create(self, name: str, email: str, password_hash: str, role: str = "student", membership_tier: str = "BASIC") -> User:
        user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password_hash=password_hash,
            role=role,
            membership_tier=membership_tier
        )
        self.db.add(user)
        self.db.flush()
        return user

    def list_all_students(self) -> List[User]:
        return self.db.query(User).filter(User.role == "student").order_by(User.id.desc()).all()

    def count_students(self) -> int:
        return self.db.query(User).filter(User.role == "student").count()

    def update_tier(self, user_id: int, new_tier: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.membership_tier = new_tier
            self.db.flush()
        return user
