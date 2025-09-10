from django.db import models

class FriendRequest(models.Model):
	class Status(models.IntegerChoices):
		PENDING = 0,
		ACCEPTED = 1

	user_sender = models.BigIntegerField()
	user_recipient = models.BigIntegerField()
	user_sender_blocked = models.BooleanField(default=False)
	user_recipient_blocked = models.BooleanField(default=False)
	status = models.IntegerField(choices=Status, default=Status.PENDING)

class Message(models.Model):
	class MessageType(models.IntegerChoices):
		TEXT = 0,
		GAME_INVITE = 1

	class InviteStatus(models.IntegerChoices):
		NONE = 0,
		PENDING = 1,
		ACCEPTED = 2,
		CANCELLED = 3,
		REJECTED = 4
	
	user_sender = models.BigIntegerField()
	user_recipient = models.BigIntegerField()
	message = models.CharField(max_length=200)
	message_read = models.BooleanField(default=False)
	message_type = models.IntegerField(choices=MessageType, default=MessageType.TEXT)
	invite_status = models.IntegerField(choices=InviteStatus, default=InviteStatus.NONE)
