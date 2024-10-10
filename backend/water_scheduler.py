from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.testing.plugin.plugin_base import config

from database.database import get_db_other
from models.models import Watering_Schedule, Config
# from routers.mqtt_router import watering_job # tránh lỗi import vòng tròn

scheduler = AsyncIOScheduler()

def add_all_schedule():
    with get_db_other() as db:
        db_schedules = db.query(Watering_Schedule).all()
        if db_schedules:
            from routers.mqtt_router import watering_job # tránh lỗi import vòng tròn
            for db_schedule in db_schedules:
                # if not db_schedule.is_active:
                #     continue
                db_time = db_schedule.time
                # hour = (db_time.hour + 7) % 24
                hour = db_time.hour
                minute = db_time.minute
                scheduler_id = db_schedule.id
                scheduler.add_job(watering_job, 'cron', hour=hour, minute=minute, id=str(db_schedule.id), args=[scheduler_id], replace_existing=True)
                print(f"add schedule {db_schedule.id} at {hour}:{minute}")

def add_a_schedule(schedule_id, hour, minute):
    from routers.mqtt_router import watering_job # tránh lỗi import vòng tròn
    scheduler.add_job(watering_job, 'cron', hour=hour, minute=minute, id=str(schedule_id), args=[schedule_id], replace_existing=True)
    print(f"add schedule {schedule_id} at {hour}:{minute}")

def remove_all_schedule():
    scheduler.remove_all_jobs()
    print("remove all schedule")

def remove_schedule(schedule_id):
    scheduler.remove_job(str(schedule_id))
    print(f"remove schedule {schedule_id}")

def start_scheduler():
    scheduler.start()
    print("start scheduler")

def stop_scheduler():
    scheduler.shutdown()
    print("stop scheduler")

def show_all_schedule():
    print("All schedule:")
    jobs = scheduler.get_jobs()
    for job in jobs:
        print(job)

# def init_scheduler():
#     db = get_db_other()
#     try:
#         my_config = db.query(Config).first()
#         if my_config:
#             if my_config.mode == "ADAPTIVE":
#                 add_all_schedule()
#                 start_scheduler()
#             else:
#                 stop_scheduler()
#     finally:
#         db.close()
#     print("init scheduler")

def init_scheduler():
    print("init scheduler...")
    add_all_schedule()
    start_scheduler()
    print("init scheduler successfully")
    show_all_schedule()