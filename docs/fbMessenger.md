curl -X GET "localhost:3002/webhook?hub.verify_token=TOKEN_HERE&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"


curl -H "Content-Type: application/json" -X POST "localhost:3002/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'