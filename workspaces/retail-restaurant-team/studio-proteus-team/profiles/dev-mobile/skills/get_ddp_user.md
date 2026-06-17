---
name: get-ddp-user
description: Fetch fresh DDP (Disney Dining Plan) test user credentials from the test API.
triggers:
  - DDP user
  - DDP credentials
  - dining plan user
  - get DDP
---

# Get DDP User Credentials
Sometimes we need fresh DDP test user credentials for testing. This skill fetches a new set of credentials from our internal API.

## Steps

1. Perform a GET request:
   ```bash
   curl -s 'http://10.89.46.233:3000/user?dataType=ddp&dataSubType=ddp'
   ```

2. The JSON response of the call should look like this:

   ```json
   {
     "email": "WorldwideMeara772@fnbtest.com",
     "password": "<password>",
     "reservationId": 617886314510,
     "swid": "{BB71B4C8-66C2-4E33-A138-41C9998F3FF6}",
     "possibleGamStatus": "Checked-In",
     "type": "ddp",
     "date": "04/20/2026"
   }
   ```

3. Display the **email** and **password** prominently with copy-friendly formatting. This is test data so showing the password is fine.

## Output Format

Present results like:

**Email:** `<email>`
**Password:** `<password>`

## Error handling
If the API call fails or returns an error, display a user-friendly message:
"Failed to fetch DDP user credentials. Please check that you are connected to the VPN or check if the service has been moved to a new IP address."
