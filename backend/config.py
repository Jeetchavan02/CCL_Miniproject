import os
from typing import Optional
from dotenv import load_dotenv

# Ensure .env is explicitly loaded from backend directory with override=True at module import time
dotenv_file = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_file, override=True)

LOCAL_DEV = os.getenv("LOCAL_DEV", "false").lower() in ("true", "1", "yes")


def get_parameter(param_name: str, default: Optional[str] = None) -> str:
    """
    Fetch parameter from AWS SSM Parameter Store using EC2 IAM Role.
    This function is only called in cloud mode (when LOCAL_DEV is false).
    """
    import boto3
    try:
        ssm = boto3.client("ssm", region_name=os.getenv("AWS_REGION", "us-east-1"))
        response = ssm.get_parameter(Name=param_name, WithDecryption=True)
        return response["Parameter"]["Value"]
    except Exception as e:
        if default is not None:
            return default
        raise RuntimeError(f"Failed to fetch parameter {param_name} from SSM Parameter Store: {str(e)}")


class Settings:
    REGION_NAME: str = os.getenv("AWS_REGION", "us-east-1")
    LOCAL_DEV: bool = LOCAL_DEV

    @property
    def DB_HOST(self) -> str:
        if self.LOCAL_DEV:
            return os.getenv("DB_HOST", "127.0.0.1")
        return get_parameter("/lostfound/db_host", default="localhost")

    @property
    def DB_PORT(self) -> int:
        if self.LOCAL_DEV:
            return int(os.getenv("DB_PORT", "3306"))
        return int(os.getenv("DB_PORT", "3306"))

    @property
    def DB_USER(self) -> str:
        if self.LOCAL_DEV:
            return os.getenv("DB_USER", "root")
        return get_parameter("/lostfound/db_user", default="root")

    @property
    def DB_PASS(self) -> str:
        if self.LOCAL_DEV:
            val = os.getenv("DB_PASS")
            if val is None:
                raise ValueError("Environment variable 'DB_PASS' is not set in .env")
            return val
        return get_parameter("/lostfound/db_pass")

    @property
    def DB_NAME(self) -> str:
        if self.LOCAL_DEV:
            return os.getenv("DB_NAME", "lostfound_db")
        return os.getenv("DB_NAME", "lostfound_db")

    @property
    def JWT_SECRET(self) -> str:
        if self.LOCAL_DEV:
            val = os.getenv("JWT_SECRET")
            if val is None:
                raise ValueError("Environment variable 'JWT_SECRET' is not set in .env")
            return val
        return get_parameter("/lostfound/jwt_secret")

    @property
    def S3_BUCKET(self) -> str:
        if self.LOCAL_DEV:
            return os.getenv("BUCKET", "")
        return get_parameter("/lostfound/bucket", default="")

    @property
    def SNS_ARN(self) -> str:
        if self.LOCAL_DEV:
            return os.getenv("SNS_ARN", "")
        return get_parameter("/lostfound/sns_arn", default="")

    @property
    def DATABASE_URL(self) -> str:
        # Construct SQLAlchemy connection URI for PyMySQL
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"


settings = Settings()
