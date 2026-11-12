from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.models.cashback_rule import CashbackRule
from app.models.monthly_cashback import MonthlyCashbackUsage

class CashbackRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_rule_by_category(self, category: str) -> Optional[CashbackRule]:
        return self.db.query(CashbackRule).filter(CashbackRule.category == category).first()

    def list_rules(self) -> List[CashbackRule]:
        return self.db.query(CashbackRule).order_by(CashbackRule.id.asc()).all()

    def create_rule(self, category: str, base_cashback_rate_bps: int, base_monthly_cap_paise: int) -> CashbackRule:
        rule = CashbackRule(
            category=category,
            base_cashback_rate_bps=base_cashback_rate_bps,
            base_monthly_cap_paise=base_monthly_cap_paise
        )
        self.db.add(rule)
        self.db.flush()
        return rule

    def get_monthly_usage(self, user_id: int, category: str, month: int, year: int) -> Optional[MonthlyCashbackUsage]:
        return (
            self.db.query(MonthlyCashbackUsage)
            .filter(
                MonthlyCashbackUsage.user_id == user_id,
                MonthlyCashbackUsage.category == category,
                MonthlyCashbackUsage.month == month,
                MonthlyCashbackUsage.year == year
            )
            .first()
        )

    def list_monthly_usages_by_user(self, user_id: int, month: int, year: int) -> List[MonthlyCashbackUsage]:
        return (
            self.db.query(MonthlyCashbackUsage)
            .filter(
                MonthlyCashbackUsage.user_id == user_id,
                MonthlyCashbackUsage.month == month,
                MonthlyCashbackUsage.year == year
            )
            .all()
        )

    def upsert_usage(self, user_id: int, category: str, month: int, year: int, add_paise: int) -> MonthlyCashbackUsage:
        usage = self.get_monthly_usage(user_id, category, month, year)
        if usage:
            usage.cashback_used_paise += add_paise
        else:
            usage = MonthlyCashbackUsage(
                user_id=user_id,
                category=category,
                month=month,
                year=year,
                cashback_used_paise=add_paise
            )
            self.db.add(usage)
        self.db.flush()
        return usage
