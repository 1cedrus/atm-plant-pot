from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)
from requests.exceptions import ConnectionError, HTTPError



# Optionally providing an access token within a session if you have enabled push security
# session = requests.Session()
# session.headers.update(
#     {
#         "Authorization": f"Bearer {os.getenv('EXPO_TOKEN')}",
#         "accept": "application/json",
#         "accept-encoding": "gzip, deflate",
#         "content-type": "application/json",
#     }
# )

def simple_send_push_message(token: str, title, message, extra=None):
    try:
        # my_token = token.split('[')[1].split(']')[0]
        response = PushClient(force_fcm_v1=True).publish(PushMessage(to=token, title=title, body=message, data=extra))
        # PushMessage(to=token, title=title, body=message, data=extra)
        response.validate_response()
        return "Notification sent successfully!"

    except (PushServerError, HTTPError, ConnectionError, PushTicketError, DeviceNotRegisteredError) as err:
        # Xử lý lỗi PushServerError
        print(f"Failed to send notification: {err}")
        return f"Error: {err}"

    except Exception as e:
        print(f"Failed to send notification: {e}")
        return f"Error: {e}"


# Basic arguments. You should extend this function with the push features you
# want to use, or simply pass in a `PushMessage` object.
# def send_push_message(token, message, extra=None):
#     try:
#         response = PushClient().publish(
#             PushMessage(to=token,
#                         body=message,
#                         data=extra))
#     except PushServerError as exc:
#         # Encountered some likely formatting/validation error.
#         rollbar.report_exc_info(
#             extra_data={
#                 'token': token,
#                 'message': message,
#                 'extra': extra,
#                 'errors': exc.errors,
#                 'response_data': exc.response_data,
#             })
#         raise
#     except (ConnectionError, HTTPError) as exc:
#         # Encountered some Connection or HTTP error - retry a few times in
#         # case it is transient.
#         rollbar.report_exc_info(
#             extra_data={'token': token, 'message': message, 'extra': extra})
#         raise self.retry(exc=exc)
#
#     try:
#         # We got a response back, but we don't know whether it's an error yet.
#         # This call raises errors so we can handle them with normal exception
#         # flows.
#         response.validate_response()
#     except DeviceNotRegisteredError:
#         # Mark the push token as inactive
#         from notifications.models import PushToken
#         PushToken.objects.filter(token=token).update(active=False)
#     except PushTicketError as exc:
#         # Encountered some other per-notification error.
#         rollbar.report_exc_info(
#             extra_data={
#                 'token': token,
#                 'message': message,
#                 'extra': extra,
#                 'push_response': exc.push_response._asdict(),
#             })
#         raise self.retry(exc=exc)