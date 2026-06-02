# SounTabeeb Backend

Express + MongoDB backend for SounTabeeb.
using mongodb atlas;

create account in mongodb atlas then create project and user:

Now create cluster(server) then connect using different connect methods provided by mongodb atlas itself copy the connection string and paste it in your project .env file:

1. Copy `connection string` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies: `npm install`.
3. Run: `npm run dev` (requires `nodemon`) or `npm start`.
