from django.urls import path

from . import views

urlpatterns = [
	path("friend_requests/create/", views.create_friend_requests, name="create_friend_requests"),
	path("friend_requests/pending/<int:sender_id>/", views.get_pending_friend_requests_by_sender, name="get_pending_friend_requests_by_sender"),
	path("friend_requests/pending_recipient/<int:recipient_id>/", views.get_pending_friend_requests_by_recipient, name="get_pending_friend_requests_by_recipient"),
	path("friend_requests/friends/<int:id>/", views.get_friends, name="get_friends"),
	path("friend_requests/friends_blocked/<int:id>/", views.get_friends_blocked, name="get_friends_blocked"),
	path("friend_requests/friends_accept/", views.accept_friend_request, name="accept_friend_request"),
	path("friend_requests/block_friend/", views.block_friend, name="block_friend"),
	path("friend_requests/unblock_friend/", views.unblock_friend, name="unblock_friend"),
	path("friend_requests/delete_friend/<int:sender_id>/<int:recipient_id>/", views.delete_friend_request, name="delete_friend_request"),
	path("messages/", views.get_messages, name="get_messages"),
	path("messages/read/<int:user_sender>/", views.get_messages_not_read, name="get_messages_not_read"),
	path("messages/read/total/", views.get_messages_not_read_total, name="get_messages_not_read_total"),
	path("messages/match/pending/<int:user_sender>/", views.get_match_pending, name="get_match_pending")
]
