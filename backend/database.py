from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://tuphan:EgXFRFwdlPqdNiVZJcDFbtEvjcuha43S@dpg-crrbus1u0jms73cil440-a.singapore-postgres.render.com/backenddb_uh54"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    # SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db  # Sử dụng yield để trả về session
    finally:
        db.close()  # Đảm bảo đóng session khi hoàn thành
