#!/bin/bash

daphne -b 0.0.0.0 -p 8080 multiplayer_service.asgi:application
