import logging
from sqlalchemy.orm import Session
from config import settings
import models

logger = logging.getLogger(__name__)


def notify_match(match: models.Match, db: Session) -> None:
    """
    Publish notification for a new match.
    - LOCAL_DEV: Prints to stdout.
    - Cloud/Production: Calls boto3 sns.publish().
    Wrapped in try/except to prevent raising errors.
    """
    try:
        lost_item = db.query(models.LostItem).filter(models.LostItem.id == match.lost_item_id).first()
        found_item = db.query(models.FoundItem).filter(models.FoundItem.id == match.found_item_id).first()

        if not lost_item or not found_item:
            logger.warning(f"Could not find lost_item ({match.lost_item_id}) or found_item ({match.found_item_id}) for match #{match.id}")
            return

        lost_item_user = db.query(models.User).filter(models.User.id == lost_item.user_id).first()
        user_name = lost_item_user.full_name if lost_item_user else "Student"

        # LOCAL_DEV mode
        if settings.LOCAL_DEV:
            output = f'[LOCAL NOTIFY] Match #{match.id}: "{lost_item.title}" → "{found_item.title}" (score: {match.confidence_score}%)'
            print(output, flush=True)
            return

        # Production mode with AWS SNS
        topic_arn = getattr(settings, "SNS_TOPIC_ARN", None) or getattr(settings, "SNS_ARN", "")
        if not topic_arn:
            logger.warning("SNS topic ARN is not configured.")
            return

        import boto3
        sns_client = boto3.client("sns", region_name=settings.REGION_NAME)
        subject = f"Lost & Found Match – {lost_item.title}"
        message = (
            f"Hi {user_name}, a match was found for your lost '{lost_item.title}'. "
            f"Found item: '{found_item.title}' at {found_item.location_found}. "
            f"Confidence: {match.confidence_score}%. Log in to review and claim."
        )

        sns_client.publish(
            TopicArn=topic_arn,
            Subject=subject,
            Message=message,
        )
        logger.info(f"SNS notification published for match #{match.id} to topic {topic_arn}")

    except Exception as e:
        logger.error(f"Error publishing match notification: {e}")
